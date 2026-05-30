import { query } from '../config/database';

export class Database {
    /**
     * Criar todas as tabelas necessárias
     */
    static async createTables(): Promise<void> {
        try {
            console.log('Criando tabelas...');

            // Tabela de imersões
            await query(
                `-- Tabela de imersões (eventos da empresa)
         CREATE TABLE IF NOT EXISTS immersions (
           id SERIAL PRIMARY KEY,
           name VARCHAR(255) NOT NULL,
           description TEXT,
           data DATE NOT NULL,
           local VARCHAR(255) NOT NULL,
           qtd_lote INT NOT NULL CHECK (qtd_lote > 0),
           valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )`
            );

            console.log('✓ Tabela immersions criada');

            // Tabela de lotes
            await query(
                `-- Tabela de lotes (relação N para 1 com imersões)
         CREATE TABLE IF NOT EXISTS lots (
           id SERIAL PRIMARY KEY,
           id_immersion INT NOT NULL,
           lote_number INT NOT NULL,
           valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
           quantity_available INT NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
           data_inicio DATE NOT NULL,
           data_fim DATE NOT NULL,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           CONSTRAINT fk_immersion FOREIGN KEY (id_immersion) 
             REFERENCES immersions(id) ON DELETE CASCADE,
           CONSTRAINT check_dates CHECK (data_fim > data_inicio),
           UNIQUE(id_immersion, lote_number)
         )`
            );

            console.log('✓ Tabela lots criada');
            console.log('✓ Tabelas criadas com sucesso!');
        } catch (error: any) {
            console.error('Erro ao criar tabelas:', error.message);
            throw error;
        }
    }

    /**
     * Dropar todas as tabelas (para desenvolvimento/teste)
     */
    static async dropTables(): Promise<void> {
        try {
            console.log('Dropando tabelas...');

            await query(`DROP TABLE IF EXISTS lots CASCADE`);
            await query(`DROP TABLE IF EXISTS immersions CASCADE`);

            console.log('✓ Tabelas dropadas com sucesso!');
        } catch (error: any) {
            console.error('Erro ao dropar tabelas:', error.message);
            throw error;
        }
    }

    /**
     * Resetar banco de dados (dropar e recriar)
     */
    static async reset(): Promise<void> {
        try {
            await this.dropTables();
            await this.createTables();
            console.log('✓ Banco de dados resetado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao resetar banco de dados:', error.message);
            throw error;
        }
    }
}

// Script de execução
const args = process.argv.slice(2);

if (args[0] === 'create') {
    Database.createTables()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
} else if (args[0] === 'drop') {
    Database.dropTables()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
} else if (args[0] === 'reset') {
    Database.reset()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
} else {
    console.log('Uso: ts-node src/config/database-setup.ts [create|drop|reset]');
    process.exit(0);
}
