export interface StateLoanConcentrationDTO {
  state: string;
  concentration: number;
  limit: number;
  isWithinLimit: boolean;
  totalValue: number;
  stateValue: number;
}
