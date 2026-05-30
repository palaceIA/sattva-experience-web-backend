import { Request, Response } from 'express';
import { ImmersionService } from '../services/ImmersionService';
import { CreateImmersionDTO, UpdateImmersionDTO } from '../models/Immersion';

export class ImmersionController {
    /**
     * Criar nova imersão
     * POST /api/immersions
     */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const { name, description, data, local, qtd_lote, valor } = req.body;

            // Validações
            if (!name || !data || !local || !qtd_lote || !valor) {
                res.status(400).json({ error: 'Campos obrigatórios faltando' });
                return;
            }

            if (qtd_lote <= 0 || valor <= 0) {
                res.status(400).json({ error: 'qtd_lote e valor devem ser maiores que zero' });
                return;
            }

            const immersion = await ImmersionService.create({
                name,
                description,
                data: new Date(data),
                local,
                qtd_lote,
                valor
            });

            res.status(201).json({
                success: true,
                message: 'Imersão criada com sucesso',
                data: immersion
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obter imersão por ID
     * GET /api/immersions/:id
     */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const immersion = await ImmersionService.getById(Number(id));

            if (!immersion) {
                res.status(404).json({ error: 'Imersão não encontrada' });
                return;
            }

            res.status(200).json({
                success: true,
                data: immersion
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obter imersão com seus lotes
     * GET /api/immersions/:id/with-lots
     */
    static async getWithLots(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const immersion = await ImmersionService.getWithLots(Number(id));

            if (!immersion) {
                res.status(404).json({ error: 'Imersão não encontrada' });
                return;
            }

            res.status(200).json({
                success: true,
                data: immersion
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Listar todas as imersões
     * GET /api/immersions
     */
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : undefined;
            const offset = req.query.offset ? Number(req.query.offset) : undefined;

            const immersions = await ImmersionService.getAll(limit, offset);

            res.status(200).json({
                success: true,
                count: immersions.length,
                data: immersions
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Listar imersões ativas (futuras)
     * GET /api/immersions/active
     */
    static async getActive(req: Request, res: Response): Promise<void> {
        try {
            const immersions = await ImmersionService.getActive();

            res.status(200).json({
                success: true,
                count: immersions.length,
                data: immersions
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Atualizar imersão
     * PUT /api/immersions/:id
     */
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, description, data, local, qtd_lote, valor } = req.body;

            const updateData: UpdateImmersionDTO = {};
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (data !== undefined) updateData.data = new Date(data);
            if (local !== undefined) updateData.local = local;
            if (qtd_lote !== undefined) updateData.qtd_lote = qtd_lote;
            if (valor !== undefined) updateData.valor = valor;

            if (Object.keys(updateData).length === 0) {
                res.status(400).json({ error: 'Nenhum campo para atualizar' });
                return;
            }

            const immersion = await ImmersionService.update(Number(id), updateData);

            if (!immersion) {
                res.status(404).json({ error: 'Imersão não encontrada' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Imersão atualizada com sucesso',
                data: immersion
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Deletar imersão
     * DELETE /api/immersions/:id
     */
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await ImmersionService.delete(Number(id));

            if (!deleted) {
                res.status(404).json({ error: 'Imersão não encontrada' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Imersão deletada com sucesso'
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
