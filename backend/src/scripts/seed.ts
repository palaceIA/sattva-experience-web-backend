import pool from '../config/database';

/**
 * Script de seed com dados de exemplo para testes
 */

async function seedDatabase() {
    try {
        console.log('🌱 Iniciando seed do banco de dados...\n');

        // Limpar dados existentes
        await pool.query('DELETE FROM lots');
        await pool.query('DELETE FROM immersions');

        console.log('✓ Dados anteriores removidos');

        // Criar imersões
        const immersionsQueries = [
            {
                name: 'Imersão de Verão 2026',
                description: 'Uma semana intensiva de aprendizado no litoral',
                data: '2026-07-15',
                local: 'Guarujá, SP',
                qtd_lote: 3,
                valor: 5000.00
            },
            {
                name: 'Retiro de Primavera 2026',
                description: 'Encontro de mindfulness e meditação',
                data: '2026-09-21',
                local: 'Serra da Mantiqueira, MG',
                qtd_lote: 4,
                valor: 3500.00
            },
            {
                name: 'Workshop de Liderança',
                description: 'Desenvolvimento de habilidades de liderança',
                data: '2026-08-10',
                local: 'São Paulo, SP',
                qtd_lote: 2,
                valor: 2500.00
            }
        ];

        let immersionCount = 0;
        for (const immersion of immersionsQueries) {
            const result = await pool.query(
                `INSERT INTO immersions (name, description, data, local, qtd_lote, valor)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
                [immersion.name, immersion.description, immersion.data, immersion.local, immersion.qtd_lote, immersion.valor]
            );
            immersionCount++;
            console.log(`✓ Imersão criada: ${immersion.name} (ID: ${result.rows[0].id})`);
        }

        console.log(`\n✓ ${immersionCount} imersões criadas\n`);

        // Criar lotes para cada imersão
        const lotsQueries = [
            // Lotes para Imersão 1
            { id_immersion: 1, lote_number: 1, valor: 4500.00, quantity_available: 50, data_inicio: '2026-06-01', data_fim: '2026-06-15' },
            { id_immersion: 1, lote_number: 2, valor: 4750.00, quantity_available: 40, data_inicio: '2026-06-16', data_fim: '2026-06-30' },
            { id_immersion: 1, lote_number: 3, valor: 5000.00, quantity_available: 30, data_inicio: '2026-07-01', data_fim: '2026-07-14' },

            // Lotes para Imersão 2
            { id_immersion: 2, lote_number: 1, valor: 3000.00, quantity_available: 60, data_inicio: '2026-07-01', data_fim: '2026-07-31' },
            { id_immersion: 2, lote_number: 2, valor: 3250.00, quantity_available: 50, data_inicio: '2026-08-01', data_fim: '2026-08-31' },
            { id_immersion: 2, lote_number: 3, valor: 3500.00, quantity_available: 40, data_inicio: '2026-09-01', data_fim: '2026-09-20' },
            { id_immersion: 2, lote_number: 4, valor: 3750.00, quantity_available: 30, data_inicio: '2026-09-21', data_fim: '2026-09-30' },

            // Lotes para Imersão 3
            { id_immersion: 3, lote_number: 1, valor: 2000.00, quantity_available: 100, data_inicio: '2026-06-15', data_fim: '2026-07-15' },
            { id_immersion: 3, lote_number: 2, valor: 2250.00, quantity_available: 80, data_inicio: '2026-07-16', data_fim: '2026-08-09' }
        ];

        let lotCount = 0;
        for (const lot of lotsQueries) {
            await pool.query(
                `INSERT INTO lots (id_immersion, lote_number, valor, quantity_available, data_inicio, data_fim)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [lot.id_immersion, lot.lote_number, lot.valor, lot.quantity_available, lot.data_inicio, lot.data_fim]
            );
            lotCount++;
            console.log(`✓ Lote ${lot.lote_number} criado para imersão ${lot.id_immersion}`);
        }

        console.log(`\n✓ ${lotCount} lotes criados`);
        console.log('\n✅ Seed concluído com sucesso!\n');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Erro ao fazer seed:', error.message);
        process.exit(1);
    }
}

seedDatabase();
