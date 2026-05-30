export interface Immersion {
    id: number;
    name: string;
    description?: string;
    data: Date;
    local: string;
    qtd_lote: number;
    image_path?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateImmersionDTO {
    name: string;
    description?: string;
    data: Date;
    local: string;
    qtd_lote: number;
}

export interface UpdateImmersionDTO {
    name?: string;
    description?: string;
    data?: Date;
    local?: string;
    qtd_lote?: number;
    image_path?: string;
}
