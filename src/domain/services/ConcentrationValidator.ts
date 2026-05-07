import { Loan } from '../entities/Loan';
import { State } from '../value-objects/State';
import { CONCENTRATION_LIMITS } from '../config/constants';

export interface ConcentrationValidationResult {
  isValid: boolean;
  currentConcentration: number;
  limit: number;
}

export class ConcentrationValidator {
  /**
   * Valida se um novo empréstimo violaria as regras de concentração
   * 
   * @param newLoanValue - Valor do novo empréstimo
   * @param newLoanState - Estado do novo empréstimo
   * @param existingLoans - Todos os empréstimos existentes
   * @returns Resultado da validação
   */
  static validate(
    newLoanValue: number,
    newLoanState: State,
    existingLoans: Loan[]
  ): ConcentrationValidationResult {
    // Calcula o valor total atual de todos os empréstimos
    const totalLoansValue = existingLoans.reduce((sum, loan) => sum + loan.getValue(), 0);
    
    // Se não há empréstimos anteriores, o primeiro empréstimo é sempre válido
    if (totalLoansValue === 0) {
      return {
        isValid: true,
        currentConcentration: 100, // Será 100% por ser o primeiro
        limit: newLoanState.getValue() === 'SP' 
          ? CONCENTRATION_LIMITS.SP 
          : CONCENTRATION_LIMITS.default
      };
    }
    
    // Calcula o valor total do novo estado após o novo empréstimo
    const loansInNewStateValue = existingLoans
      .filter(loan => loan.getState().equals(newLoanState))
      .reduce((sum, loan) => sum + loan.getValue(), 0);
    
    const newTotalForState = loansInNewStateValue + newLoanValue;
    const newGrandTotal = totalLoansValue + newLoanValue;
    
    // Calcula a concentração percentual para o novo estado
    const newConcentrationPercentage = (newTotalForState / newGrandTotal) * 100;
    
    // Define o limite para este estado
    const limit = newLoanState.getValue() === 'SP' 
      ? CONCENTRATION_LIMITS.SP 
      : CONCENTRATION_LIMITS.default;
    
    // Valida se a concentração excede o limite
    const isValid = newConcentrationPercentage <= limit;
    
    return {
      isValid,
      currentConcentration: newConcentrationPercentage,
      limit
    };
  }
}
