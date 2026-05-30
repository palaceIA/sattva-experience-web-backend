import { query } from '../config/database';
import { Immersion, CreateImmersionDTO, UpdateImmersionDTO } from '../models/Immersion';

export class ImmersionService {
    static async create(data: CreateImmersionDTO): Promise<Immersion> {
        const result = await query(
            `INSERT INTO immersions (name, description, data, local, qtd_lote, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
            [data.name, data.description || null, data.data, data.local, data.qtd_lote]
        );

        return result.rows[0];
    }

    static async getById(id: number): Promise<Immersion | null> {
        const result = await query(
            `SELECT * FROM immersions WHERE id = $1`,
            [id]
        );

        return result.rows[0] || null;
    }

    static async getAll(limit?: number, offset?: number): Promise<Immersion[]> {
        let sql = `SELECT * FROM immersions ORDER BY data DESC`;
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

    static async getActive(): Promise<Immersion[]> {
        const result = await query(
            `SELECT * FROM immersions WHERE data >= CURRENT_DATE ORDER BY data ASC`
        );

        return result.rows;
    }

    static async update(id: number, data: UpdateImmersionDTO): Promise<Immersion | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.name !== undefined) {
            fields.push(`name = $${paramCount++}`);
            values.push(data.name);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${paramCount++}`);
            values.push(data.description);
        }
        if (data.data !== undefined) {
            fields.push(`data = $${paramCount++}`);
            values.push(data.data);
        }
        if (data.local !== undefined) {
            fields.push(`local = $${paramCount++}`);
            values.push(data.local);
        }
        if (data.qtd_lote !== undefined) {
            fields.push(`qtd_lote = $${paramCount++}`);
            values.push(data.qtd_lote);
        }
        if (data.image_path !== undefined) {
            fields.push(`image_path = $${paramCount++}`);
            values.push(data.image_path);
        }

        if (fields.length === 0) {
            return this.getById(id);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await query(
            `UPDATE immersions SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        return result.rows[0] || null;
    }

    static async delete(id: number): Promise<boolean> {
        const result = await query(
            `DELETE FROM immersions WHERE id = $1`,
            [id]
        );

        return result.rowCount! > 0;
    }

    static async getWithLots(id: number) {
        const result = await query(
            `SELECT i.*, 
              json_agg(
                json_build_object(
                  'id', l.id,
                  'lote_number', l.lote_number,
                  'valor', l.valor,
                  'quantity_available', l.quantity_available,
                  'data_inicio', l.data_inicio,
                  'data_fim', l.data_fim,
                  'is_active', l.data_fim >= CURRENT_DATE AND l.data_inicio <= CURRENT_DATE
                )
              ) FILTER (WHERE l.id IS NOT NULL) as lots
       FROM immersions i
       LEFT JOIN lots l ON i.id = l.id_immersion
       WHERE i.id = $1
       GROUP BY i.id`,
            [id]
        );

        return result.rows[0] || null;
    }
}
