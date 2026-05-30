/**
 * Tipos TypeScript para integração com o frontend
 * Copie este arquivo para seu projeto frontend
 */

// ============================================
// TIPOS - IMERSÕES
// ============================================

export interface Immersion {
    id: number;
    name: string;
    description?: string;
    data: string; // ISO Date
    local: string;
    qtd_lote: number;
    valor: number;
    created_at: string; // ISO DateTime
    updated_at: string; // ISO DateTime
}

export interface CreateImmersionDTO {
    name: string;
    description?: string;
    data: string; // ISO Date
    local: string;
    qtd_lote: number;
    valor: number;
}

export interface UpdateImmersionDTO {
    name?: string;
    description?: string;
    data?: string;
    local?: string;
    qtd_lote?: number;
    valor?: number;
}

export interface ImmersionWithLots extends Immersion {
    lots: Lot[];
}

// ============================================
// TIPOS - LOTES
// ============================================

export interface Lot {
    id: number;
    id_immersion: number;
    lote_number: number;
    valor: number;
    quantity_available: number;
    data_inicio: string; // ISO Date
    data_fim: string; // ISO Date
    created_at: string; // ISO DateTime
}

export interface LotWithImmersion extends Lot {
    immersion_name?: string;
}

export interface CreateLotDTO {
    id_immersion: number;
    lote_number: number;
    valor: number;
    quantity_available: number;
    data_inicio: string; // ISO Date
    data_fim: string; // ISO Date
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

// ============================================
// TIPOS - RESPOSTAS DA API
// ============================================

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

// ============================================
// TIPOS - REQUISIÇÕES ESPECIAIS
// ============================================

export interface BuyLotsRequest {
    quantity: number;
}

export interface AddQuantityRequest {
    quantity: number;
}

// ============================================
// HELPERS - FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Verifica se um lote está ativo
 */
export function isLotActive(lot: Lot, today: Date = new Date()): boolean {
    const today_date = new Date(today);
    today_date.setHours(0, 0, 0, 0);

    const dataInicio = new Date(lot.data_inicio);
    dataInicio.setHours(0, 0, 0, 0);

    const dataFim = new Date(lot.data_fim);
    dataFim.setHours(0, 0, 0, 0);

    return today_date >= dataInicio && today_date <= dataFim;
}

/**
 * Calcula dias restantes de um lote
 */
export function getDaysRemaining(lot: Lot, today: Date = new Date()): number {
    const dataFim = new Date(lot.data_fim);
    const today_date = new Date(today);

    const diffTime = dataFim.getTime() - today_date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Calcula porcentagem vendida
 */
export function getPercentageSold(lot: Lot, totalQuantity: number): number {
    const sold = totalQuantity - lot.quantity_available;
    return (sold / totalQuantity) * 100;
}

/**
 * Formata valor em BRL
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata data para exibição
 */
export function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(dateString));
}

/**
 * Obtém status do lote em palavras
 */
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

// ============================================
// CLIENT API - EXEMPLO DE INTEGRAÇÃO
// ============================================

export class SattvaExperienceAPI {
    private baseURL: string = 'http://localhost:3000/api';

    /**
     * Busca imersão com seus lotes
     */
    async getImmersionWithLots(immersionId: number): Promise<ImmersionWithLots> {
        const response = await fetch(`${this.baseURL}/immersions/${immersionId}/with-lots`);
        const result = await response.json();
        return result.data;
    }

    /**
     * Busca lote ativo de uma imersão
     */
    async getActiveLot(immersionId: number): Promise<Lot | null> {
        const response = await fetch(`${this.baseURL}/immersions/${immersionId}/active-lot`);

        if (response.status === 404) {
            return null;
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Compra lugares em um lote
     */
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

    /**
     * Lista imersões ativas
     */
    async getActiveImmersions(): Promise<Immersion[]> {
        const response = await fetch(`${this.baseURL}/immersions/active`);
        const result = await response.json();
        return result.data;
    }

    /**
     * Lista lotes próximos de expirar
     */
    async getUpcomingExpiryLots(days: number = 7): Promise<LotWithImmersion[]> {
        const response = await fetch(`${this.baseURL}/lots/upcoming-expiry?days=${days}`);
        const result = await response.json();
        return result.data;
    }
}

// Uso no frontend:
// const api = new SattvaExperienceAPI();
// const immersion = await api.getImmersionWithLots(1);
// const activeLot = await api.getActiveLot(1);
// await api.buyLot(1, 2);
