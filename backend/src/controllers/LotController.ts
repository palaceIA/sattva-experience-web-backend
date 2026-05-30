import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LotService } from '../services/LotService';
import { CreateLotDTO, UpdateLotDTO } from '../models/Lot';
import { supabase, isSupabaseConfigured } from '../config/supabase';

export class LotController {
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const { id_immersion, lote_number, valor, quantity_available, data_inicio, data_fim } = req.body;

            if (!id_immersion || !lote_number || !valor || quantity_available === undefined || !data_inicio || !data_fim) {
                res.status(400).json({ error: 'Campos obrigatórios faltando' });
                return;
            }

            if (valor <= 0 || quantity_available < 0) {
                res.status(400).json({ error: 'valor deve ser maior que zero e quantity_available não pode ser negativo' });
                return;
            }

            const dataInicio = new Date(data_inicio);
            const dataFim = new Date(data_fim);

            if (dataFim <= dataInicio) {
                res.status(400).json({ error: 'data_fim deve ser maior que data_inicio' });
                return;
            }

            const lot = await LotService.create({
                id_immersion,
                lote_number,
                valor,
                quantity_available,
                data_inicio: dataInicio,
                data_fim: dataFim
            });

            res.status(201).json({
                success: true,
                message: 'Lote criado com sucesso',
                data: lot
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async uploadImage(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const file = req.file as Express.Multer.File | undefined;

            if (!file) {
                res.status(400).json({ error: 'Arquivo de imagem não fornecido' });
                return;
            }

            const lotId = Number(id);
            if (Number.isNaN(lotId) || lotId <= 0) {
                res.status(400).json({ error: 'ID de lote inválido' });
                return;
            }

            if (!isSupabaseConfigured || !supabase) {
                res.status(503).json({ error: 'Supabase storage não configurado. Upload de imagens indisponível.' });
                return;
            }

            const bucket = 'lot-images';
            const fileName = `${lotId}/${uuidv4()}-${file.originalname}`;
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    cacheControl: 'public, max-age=31536000',
                    upsert: false
                });

            if (error) {
                console.error('Supabase upload error:', error.message);
                res.status(500).json({ error: 'Falha ao enviar imagem para o Supabase' });
                return;
            }

            const publicUrlResponse = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            const publicUrl = publicUrlResponse.data?.publicUrl;
            if (!publicUrl) {
                console.error('Supabase getPublicUrl failed:', publicUrlResponse);
                res.status(500).json({ error: 'Erro ao obter URL pública da imagem' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Imagem enviada com sucesso',
                data: {
                    path: data.path,
                    publicUrl
                }
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const lot = await LotService.getById(Number(id));

            if (!lot) {
                res.status(404).json({ error: 'Lote não encontrado' });
                return;
            }

            res.status(200).json({
                success: true,
                data: lot
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : undefined;
            const offset = req.query.offset ? Number(req.query.offset) : undefined;

            const lots = await LotService.getAll(limit, offset);

            res.status(200).json({
                success: true,
                count: lots.length,
                data: lots
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByImmersionId(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const lots = await LotService.getByImmersionId(Number(id));

            res.status(200).json({
                success: true,
                count: lots.length,
                data: lots
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getActiveLot(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const lot = await LotService.getActiveLot(Number(id));

            if (!lot) {
                res.status(404).json({ error: 'Nenhum lote ativo encontrado' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Lote ativo da imersão',
                data: lot
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getUpcomingLotsToExpire(req: Request, res: Response): Promise<void> {
        try {
            const daysBeforeExpiry = req.query.days ? Number(req.query.days) : 7;
            const lots = await LotService.getUpcomingLotsToExpire(daysBeforeExpiry);

            res.status(200).json({
                success: true,
                count: lots.length,
                message: `Lotes próximos de expirar nos próximos ${daysBeforeExpiry} dias`,
                data: lots
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getExpiredLots(req: Request, res: Response): Promise<void> {
        try {
            const lots = await LotService.getExpiredLots();

            res.status(200).json({
                success: true,
                count: lots.length,
                data: lots
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { valor, quantity_available, data_inicio, data_fim } = req.body;

            const updateData: UpdateLotDTO = {};
            if (valor !== undefined) updateData.valor = valor;
            if (quantity_available !== undefined) updateData.quantity_available = quantity_available;
            if (data_inicio !== undefined) updateData.data_inicio = new Date(data_inicio);
            if (data_fim !== undefined) updateData.data_fim = new Date(data_fim);

            if (Object.keys(updateData).length === 0) {
                res.status(400).json({ error: 'Nenhum campo para atualizar' });
                return;
            }

            const lot = await LotService.update(Number(id), updateData);

            if (!lot) {
                res.status(404).json({ error: 'Lote não encontrado' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Lote atualizado com sucesso',
                data: lot
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async buy(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { quantity } = req.body;

            if (!quantity || quantity < 1) {
                res.status(400).json({ error: 'Quantidade inválida' });
                return;
            }

            const lot = await LotService.decrementQuantity(Number(id), quantity);

            if (!lot) {
                res.status(400).json({ error: 'Quantidade insuficiente ou lote não encontrado' });
                return;
            }

            res.status(200).json({
                success: true,
                message: `${quantity} lugar(es) comprado(s) com sucesso`,
                data: lot
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async addQuantity(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { quantity } = req.body;

            if (!quantity || quantity < 1) {
                res.status(400).json({ error: 'Quantidade inválida' });
                return;
            }

            const lot = await LotService.incrementQuantity(Number(id), quantity);

            if (!lot) {
                res.status(404).json({ error: 'Lote não encontrado' });
                return;
            }

            res.status(200).json({
                success: true,
                message: `${quantity} lugar(es) adicionado(s) com sucesso`,
                data: lot
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await LotService.delete(Number(id));

            if (!deleted) {
                res.status(404).json({ error: 'Lote não encontrado' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Lote deletado com sucesso'
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
