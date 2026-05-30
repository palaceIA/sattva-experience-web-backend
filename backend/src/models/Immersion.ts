export interface Immersion {
    id: number;
    name: string;
    description?: string;
    data: Date;
    local: string;
    qtd_lote: number;
    valor: number;
    created_at: Date;
    updated_at: Date;
}

export interface CreateImmersionDTO {
    name: string;
    description?: string;
    data: Date;
    local: string;
    qtd_lote: number;
    valor: number;
}

export interface UpdateImmersionDTO {
    name?: string;
    description?: string;
    data?: Date;
    local?: string;
    qtd_lote?: number;
    valor?: number;
}
