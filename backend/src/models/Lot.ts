export interface Lot {
    id: number;
    id_immersion: number;
    lote_number: number;
    valor: number;
    quantity_available: number;
    data_inicio: Date;
    data_fim: Date;
    created_at: Date;
    is_active?: boolean;
}

export interface CreateLotDTO {
    id_immersion: number;
    lote_number: number;
    valor: number;
    quantity_available: number;
    data_inicio: Date;
    data_fim: Date;
}

export interface UpdateLotDTO {
    valor?: number;
    quantity_available?: number;
    data_inicio?: Date;
    data_fim?: Date;
}

export interface LotWithImmersion extends Lot {
    immersion_name?: string;
}
