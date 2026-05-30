import { query } from '../config/database';
import { Lot, CreateLotDTO, UpdateLotDTO, LotWithImmersion } from '../models/Lot';

export class LotService {
    /**
     * Criar um novo lote
     */
    static async create(data: CreateLotDTO): Promise<Lot> {
        const result = await query(
            `INSERT INTO lots (id_immersion, lote_number, valor, quantity_available, data_inicio, data_fim, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
            [data.id_immersion, data.lote_number, data.valor, data.quantity_available, data.data_inicio, data.data_fim]
        );

        return result.rows[0];
    }

    /**
     * Obter lote por ID
     */
    static async getById(id: number): Promise<Lot | null> {
        const result = await query(
            `SELECT * FROM lots WHERE id = $1`,
            [id]
        );

        return result.rows[0] || null;
    }

    /**
     * Obter todos os lotes
     */
    static async getAll(limit?: number, offset?: number): Promise<Lot[]> {
        let sql = `SELECT * FROM lots ORDER BY id_immersion ASC, lote_number ASC`;
        const params: any[] = [];

        if (limit) {
            params.push(limit);
            sql += ` LIMIT $${params.length}`;
        }

        if (offset) {
            params.push(offset);
            sql += ` OFFSET $${params.length}`;
        }

        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Obter lotes de uma imersão
     */
    static async getByImmersionId(immersionId: number): Promise<Lot[]> {
        const result = await query(
            `SELECT * FROM lots WHERE id_immersion = $1 ORDER BY lote_number ASC`,
            [immersionId]
        );

        return result.rows;
    }

    /**
     * Obter o lote ativo (atual) de uma imersão
     * Lógica: quando data_fim é atingida, vai para o próximo lote
     */
    static async getActiveLot(immersionId: number): Promise<Lot | null> {
        // Primeiro, busca o lote cuja data está dentro do intervalo
        const result = await query(
            `SELECT * FROM lots 
       WHERE id_immersion = $1 
       AND CURRENT_DATE >= data_inicio 
       AND CURRENT_DATE <= data_fim
       ORDER BY lote_number ASC
       LIMIT 1`,
            [immersionId]
        );

        if (result.rows.length > 0) {
            return result.rows[0];
        }

        // Se não encontrou, busca o próximo lote (cujo início é depois de hoje)
        const nextResult = await query(
            `SELECT * FROM lots 
       WHERE id_immersion = $1 
       AND data_inicio > CURRENT_DATE
       ORDER BY lote_number ASC
       LIMIT 1`,
            [immersionId]
        );

        return nextResult.rows[0] || null;
    }

    /**
     * Obter lotes próximos de vencer
     */
    static async getUpcomingLotsToExpire(daysBeforeExpiry: number = 7): Promise<LotWithImmersion[]> {
        const result = await query(
            `SELECT l.*, i.name as immersion_name
       FROM lots l
       JOIN immersions i ON l.id_immersion = i.id
       WHERE l.data_fim <= CURRENT_DATE + $1 * INTERVAL '1 day'
       AND l.data_fim > CURRENT_DATE
       ORDER BY l.data_fim ASC`,
            [daysBeforeExpiry]
        );

        return result.rows;
    }

    /**
     * Obter lotes expirados
     */
    static async getExpiredLots(): Promise<LotWithImmersion[]> {
        const result = await query(
            `SELECT l.*, i.name as immersion_name
       FROM lots l
       JOIN immersions i ON l.id_immersion = i.id
       WHERE l.data_fim < CURRENT_DATE
       ORDER BY l.data_fim DESC`
        );

        return result.rows;
    }

    /**
     * Atualizar lote
     */
    static async update(id: number, data: UpdateLotDTO): Promise<Lot | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.valor !== undefined) {
            fields.push(`valor = $${paramCount++}`);
            values.push(data.valor);
        }
        if (data.quantity_available !== undefined) {
            fields.push(`quantity_available = $${paramCount++}`);
            values.push(data.quantity_available);
        }
        if (data.data_inicio !== undefined) {
            fields.push(`data_inicio = $${paramCount++}`);
            values.push(data.data_inicio);
        }
        if (data.data_fim !== undefined) {
            fields.push(`data_fim = $${paramCount++}`);
            values.push(data.data_fim);
        }

        if (fields.length === 0) {
            return this.getById(id);
        }

        values.push(id);

        const result = await query(
            `UPDATE lots SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        return result.rows[0] || null;
    }

    /**
     * Decrementar quantidade disponível (quando alguém compra um lugar)
     */
    static async decrementQuantity(id: number, quantity: number = 1): Promise<Lot | null> {
        const result = await query(
            `UPDATE lots 
       SET quantity_available = quantity_available - $1
       WHERE id = $2 
       AND quantity_available >= $1
       RETURNING *`,
            [quantity, id]
        );

        return result.rows[0] || null;
    }

    /**
     * Incrementar quantidade disponível
     */
    static async incrementQuantity(id: number, quantity: number = 1): Promise<Lot | null> {
        const result = await query(
            `UPDATE lots 
       SET quantity_available = quantity_available + $1
       WHERE id = $2
       RETURNING *`,
            [quantity, id]
        );

        return result.rows[0] || null;
    }

    /**
     * Deletar lote
     */
    static async delete(id: number): Promise<boolean> {
        const result = await query(
            `DELETE FROM lots WHERE id = $1`,
            [id]
        );

        return result.rowCount! > 0;
    }

    /**
     * Verificar e atualizar lote ativo
     * Esta função verifica se o lote atual expirou e muda para o próximo
     */
    static async checkAndUpdateActiveLot(immersionId: number): Promise<Lot | null> {
        // Busca o lote atual (que deveria estar ativo)
        const currentResult = await query(
            `SELECT * FROM lots 
       WHERE id_immersion = $1 
       AND CURRENT_DATE >= data_inicio 
       AND CURRENT_DATE <= data_fim
       ORDER BY lote_number ASC
       LIMIT 1`,
            [immersionId]
        );

        if (currentResult.rows.length > 0) {
            return currentResult.rows[0];
        }

        // Se não encontrou um ativo, tenta pegar o próximo
        const nextResult = await query(
            `SELECT * FROM lots 
       WHERE id_immersion = $1 
       AND data_inicio > CURRENT_DATE
       ORDER BY lote_number ASC
       LIMIT 1`,
            [immersionId]
        );

        return nextResult.rows[0] || null;
    }
}
