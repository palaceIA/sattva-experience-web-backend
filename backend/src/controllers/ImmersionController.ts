import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ImmersionService } from '../services/ImmersionService';
import { CreateImmersionDTO, UpdateImmersionDTO } from '../models/Immersion';
import { isSupabaseConfigured, supabase } from '../config/supabase';

export class ImmersionController {
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const { name, description, data, local, qtd_lote } = req.body;

            if (!name || !data || !local || !qtd_lote) {
                res.status(400).json({ error: 'Campos obrigatórios faltando' });
                return;
            }

            if (qtd_lote <= 0) {
                res.status(400).json({ error: 'qtd_lote deve ser maior que zero' });
                return;
            }

            const immersion = await ImmersionService.create({
                name,
                description,
                data: new Date(data),
                local,
                qtd_lote
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

    static async uploadImage(req: Request, res: Response): Promise<void> {
        try {
            const { id: bodyId } = req.body;
            const file = req.file as Express.Multer.File | undefined;

            if (!file) {
                res.status(400).json({ error: 'Arquivo de imagem não fornecido' });
                return;
            }

            if (bodyId === undefined || bodyId === null || bodyId === '') {
                res.status(400).json({ error: 'Campo id é obrigatório no body da requisição' });
                return;
            }

            const immersionId = Number(bodyId);

            if (Number.isNaN(immersionId) || immersionId <= 0) {
                res.status(400).json({ error: 'ID de imersão inválido' });
                return;
            }

            if (!isSupabaseConfigured || !supabase) {
                res.status(503).json({ error: 'Supabase storage não configurado. Upload de imagens indisponível.' });
                return;
            }

            const bucket = 'immersion-images';
            const fileName = `${immersionId}/${uuidv4()}-${file.originalname}`;
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

            const immersion = await ImmersionService.update(immersionId, { image_path: publicUrl });

            if (!immersion) {
                res.status(404).json({ error: 'Imersão não encontrada' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Imagem enviada com sucesso',
                data: {
                    path: data.path,
                    publicUrl,
                    immersion
                }
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, description, data, local, qtd_lote, image_path } = req.body;

            const updateData: UpdateImmersionDTO = {};
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (data !== undefined) updateData.data = new Date(data);
            if (local !== undefined) updateData.local = local;
            if (qtd_lote !== undefined) updateData.qtd_lote = qtd_lote;
            if (image_path !== undefined) updateData.image_path = image_path;

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
