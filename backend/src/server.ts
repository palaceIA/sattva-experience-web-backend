import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import immersionRoutes from './routes/immersionRoutes';
import lotRoutes from './routes/lotRoutes';
import authRoutes from './routes/authRoutes';
import { swaggerDocument } from './swagger';
import { ensureBucket, isSupabaseConfigured } from './config/supabase';

const app: Express = express();
const port = process.env.PORT || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000'];

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy: Origin not allowed'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [],
    credentials: false
};

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas requisições vindas deste IP, tente novamente mais tarde.'
});

const authLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas tentativas de login, tente novamente mais tarde.'
});

// Middleware
app.use(helmet());
app.disable('x-powered-by');
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.removeHeader('Authorization');
    next();
});
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLoginLimiter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'Sattva Experience API',
        version: '1.0.0',
        endpoints: {
            immersions: '/api/immersions',
            lots: '/api/lots',
            auth: '/api/auth/login',
            docs: '/api-docs',
            docsV1: '/api/v1/docs',
            health: '/health'
        }
    });
});

app.use(['/api-docs', '/api/v1/docs'], swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get(['/api-docs-json', '/api/v1/docs-json'], (req, res) => res.json(swaggerDocument));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/immersions', immersionRoutes);
app.use('/api/lots', lotRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message
    });
});

// 404 handler - DEVE SER O ULTIMO
app.use((req, res) => {
    res.status(404).json({
        error: 'Rota nao encontrada',
        path: req.path
    });
});

// Start server
async function startServer() {
    if (isSupabaseConfigured) {
        try {
            await ensureBucket('lot-images');
        } catch (error: any) {
            console.warn('Falha ao inicializar o Supabase Storage:', error.message || error);
        }
    } else {
        console.warn('Supabase storage não configurado. Upload de imagens ficará indisponível.');
    }

    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
        console.log(`Health check: http://localhost:${port}/health`);
    });
}

startServer();

export default app;