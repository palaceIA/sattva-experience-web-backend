export interface Immersion {
    id: number;
    name: string;
    description?: string;
    data: string;
    local: string;
    qtd_lote: number;
    image_path?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateImmersionDTO {
    name: string;
    description?: string;
    data: string;
    local: string;
    qtd_lote: number;
}

export interface UpdateImmersionDTO {
    name?: string;
    description?: string;
    data?: string;
    local?: string;
    qtd_lote?: number;
    image_path?: string;
}

export interface ImmersionWithLots extends Immersion {
    lots: Lot[];
}

export interface Lot {
    id: number;
    id_immersion: number;
    lote_number: number;
    valor: number;
    quantity_available: number;
    data_inicio: string;
    data_fim: string;
    created_at: string;
}

export interface LotWithImmersion extends Lot {
    immersion_name?: string;
}

export interface CreateLotDTO {
    id_immersion: number;
    lote_number: number;
    valor: number;
    quantity_available: number;
    data_inicio: string;
    data_fim: string;
}

export interface UpdateLotDTO {
    valor?: number;
    quantity_available?: number;
    data_inicio?: string;
    data_fim?: string;
}

export interface LotStatus {
    id: number;
    lote_number: number;
    is_active: boolean;
    days_remaining: number;
    percentage_sold: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    count?: number;
}

export interface ApiListResponse<T> {
    success: boolean;
    count: number;
    data: T[];
    message?: string;
}

export interface ApiSingleResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface BuyLotsRequest {
    quantity: number;
}

export interface AddQuantityRequest {
    quantity: number;
}
export function isLotActive(lot: Lot, today: Date = new Date()): boolean {
    const today_date = new Date(today);
    today_date.setHours(0, 0, 0, 0);

    const dataInicio = new Date(lot.data_inicio);
    dataInicio.setHours(0, 0, 0, 0);

    const dataFim = new Date(lot.data_fim);
    dataFim.setHours(0, 0, 0, 0);

    return today_date >= dataInicio && today_date <= dataFim;
}
export function getDaysRemaining(lot: Lot, today: Date = new Date()): number {
    const dataFim = new Date(lot.data_fim);
    const today_date = new Date(today);

    const diffTime = dataFim.getTime() - today_date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}
export function getPercentageSold(lot: Lot, totalQuantity: number): number {
    const sold = totalQuantity - lot.quantity_available;
    return (sold / totalQuantity) * 100;
}
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}
export function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(dateString));
}
export function getLotStatusLabel(lot: Lot, totalQuantity: number): string {
    const daysRemaining = getDaysRemaining(lot);

    if (daysRemaining < 0) {
        return 'Expirado';
    } else if (daysRemaining === 0) {
        return 'Vence hoje';
    } else if (daysRemaining <= 7) {
        return `Vence em ${daysRemaining} dias`;
    } else if (isLotActive(lot)) {
        return 'Ativo';
    } else if (daysRemaining > 0) {
        return `Inicia em ${daysRemaining} dias`;
    }

    return 'Desconhecido';
}

export class SattvaExperienceAPI {
    private baseURL: string = 'http://localhost:3000/api';
    async getImmersionWithLots(immersionId: number): Promise<ImmersionWithLots> {
        const response = await fetch(`${this.baseURL}/immersions/${immersionId}/with-lots`);
        const result = await response.json();
        return result.data;
    }
    async getActiveLot(immersionId: number): Promise<Lot | null> {
        const response = await fetch(`${this.baseURL}/immersions/${immersionId}/active-lot`);

        if (response.status === 404) {
            return null;
        }

        const result = await response.json();
        return result.data;
    }
    async buyLot(lotId: number, quantity: number): Promise<Lot> {
        const response = await fetch(`${this.baseURL}/lots/${lotId}/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error);
        }

        return result.data;
    }
    async getActiveImmersions(): Promise<Immersion[]> {
        const response = await fetch(`${this.baseURL}/immersions/active`);
        const result = await response.json();
        return result.data;
    }
    async getUpcomingExpiryLots(days: number = 7): Promise<LotWithImmersion[]> {
        const response = await fetch(`${this.baseURL}/lots/upcoming-expiry?days=${days}`);
        const result = await response.json();
        return result.data;
    }
}
