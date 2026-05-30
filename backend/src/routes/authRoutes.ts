import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
}
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '1h') as jwt.SignOptions['expiresIn'];

router.post('/login', async (req: Request, res: Response) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({
            error: 'Nome e senha sao obrigatorios'
        });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE name = $1', [name]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                error: 'Usuario ou senha invalidos'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Usuario ou senha invalidos'
            });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                name: user.name
            }
        });

    } catch (error) {
        if ((error as any)?.code === '28P01') {
            return res.status(503).json({
                error: 'Falha na autenticacao com o banco de dados. Verifique o DATABASE_URL e a senha do Supabase.'
            });
        }

        console.error('Erro no login:', error);
        return res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

const useAuth = process.env.NODE_ENV === 'production';

if (useAuth) {
    router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Token invalido ou expirado' });
            }

            const result = await pool.query(
                'SELECT id, name, created_at FROM users WHERE id = $1',
                [userId]
            );

            const user = result.rows[0];

            if (!user) {
                return res.status(404).json({ error: 'Usuario nao encontrado' });
            }

            return res.json({ user });

        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });
} else {
    router.get('/me', async (req: Request, res: Response) => {
        try {
            const result = await pool.query('SELECT id, name, created_at FROM users LIMIT 1');
            const user = result.rows[0];

            if (!user) {
                return res.status(404).json({ error: 'Usuario nao encontrado' });
            }

            return res.json({ user });
        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });
}

export default router;