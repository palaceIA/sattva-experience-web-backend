import { query } from '../config/database';
import { Lot, CreateLotDTO, UpdateLotDTO, LotWithImmersion } from '../models/Lot';

export class LotService {
    private static baseSelect = `
        SELECT l.*, i.name AS immersion_name
        FROM lots l
        LEFT JOIN immersions i ON i.id = l.id_immersion
    `;

    static async create(data: CreateLotDTO): Promise<Lot> {
        const result = await query(
            `INSERT INTO lots (id_immersion, lote_number, valor, quantity_available, data_inicio, data_fim, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
            [data.id_immersion, data.lote_number, data.valor, data.quantity_available, data.data_inicio, data.data_fim]
        );

        return result.rows[0];
    }

    static async getById(id: number): Promise<LotWithImmersion | null> {
        const result = await query(
            `${this.baseSelect} WHERE l.id = $1`,
            [id]
        );

        return result.rows[0] || null;
    }

    static async getAll(limit?: number, offset?: number): Promise<LotWithImmersion[]> {
        let sql = `${this.baseSelect} ORDER BY l.id_immersion ASC, l.lote_number ASC`;
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

    static async getByImmersionId(immersionId: number): Promise<LotWithImmersion[]> {
        const result = await query(
            `${this.baseSelect} WHERE l.id_immersion = $1 ORDER BY l.lote_number ASC`,
            [immersionId]
        );

        return result.rows;
    }

    static async getActiveLot(immersionId: number): Promise<LotWithImmersion | null> {
        const result = await query(
            `${this.baseSelect}
       WHERE l.id_immersion = $1 
       AND CURRENT_DATE >= l.data_inicio 
       AND CURRENT_DATE <= l.data_fim
       ORDER BY l.lote_number ASC
       LIMIT 1`,
            [immersionId]
        );

        if (result.rows.length > 0) {
            return result.rows[0];
        }

        const nextResult = await query(
            `${this.baseSelect}
          WHERE l.id_immersion = $1 
          AND l.data_inicio > CURRENT_DATE
          ORDER BY l.lote_number ASC
       LIMIT 1`,
            [immersionId]
        );

        return nextResult.rows[0] || null;
    }

    static async getUpcomingLotsToExpire(daysBeforeExpiry: number = 7): Promise<LotWithImmersion[]> {
        const result = await query(
            `${this.baseSelect}
       WHERE l.data_fim <= CURRENT_DATE + $1 * INTERVAL '1 day'
       AND l.data_fim > CURRENT_DATE
       ORDER BY l.data_fim ASC`,
            [daysBeforeExpiry]
        );

        return result.rows;
    }

    static async getExpiredLots(): Promise<LotWithImmersion[]> {
        const result = await query(
            `${this.baseSelect}
       WHERE l.data_fim < CURRENT_DATE
       ORDER BY l.data_fim DESC`
        );

        return result.rows;
    }

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

    static async delete(id: number): Promise<boolean> {
        const result = await query(
            `DELETE FROM lots WHERE id = $1`,
            [id]
        );

        return result.rowCount! > 0;
    }

    static async checkAndUpdateActiveLot(immersionId: number): Promise<LotWithImmersion | null> {
        const currentResult = await query(
            `${this.baseSelect}
       WHERE l.id_immersion = $1 
       AND CURRENT_DATE >= l.data_inicio 
       AND CURRENT_DATE <= l.data_fim
       ORDER BY l.lote_number ASC
       LIMIT 1`,
            [immersionId]
        );

        if (currentResult.rows.length > 0) {
            return currentResult.rows[0];
        }

        const nextResult = await query(
            `${this.baseSelect}
          WHERE l.id_immersion = $1 
          AND l.data_inicio > CURRENT_DATE
          ORDER BY l.lote_number ASC
       LIMIT 1`,
            [immersionId]
        );

        return nextResult.rows[0] || null;
    }
}
