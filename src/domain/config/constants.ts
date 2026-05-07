// UFs brasileiras válidas
export const VALID_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

// Limites de concentração por estado (em porcentagem)
export const CONCENTRATION_LIMITS = {
  default: 10,  // 10% para a maioria dos estados
  SP: 20        // 20% para São Paulo
} as const;

// Tipos
export type ValidState = typeof VALID_STATES[number];
