import { State } from '../../domain/value-objects/State';
import { Loan } from '../../domain/entities/Loan';
import { ConcentrationValidator } from '../../domain/services/ConcentrationValidator';
import { ILoanRepository } from '../../domain/repositories/LoanRepository';
import { StateLoanConcentrationDTO } from '../dtos/StateLoanConcentrationDTO';
import { CONCENTRATION_LIMITS } from '../../domain/config/constants';

export class GetStateLoanConcentrationUseCase {
  constructor(private loanRepository: ILoanRepository) {}

  async execute(stateCode: string): Promise<StateLoanConcentrationDTO> {
    // 1. Validar e criar o Value Object State
    const state = State.create(stateCode);

    // 2. Buscar todos os empréstimos
    const allLoans = await this.loanRepository.findAll();

    // 3. Buscar empréstimos do estado específico
    const stateLoans = await this.loanRepository.findByState(state);

    // 4. Calcular valores totais
    const totalValue = allLoans.reduce((sum, loan) => sum + loan.getValue(), 0);
    const stateValue = stateLoans.reduce((sum, loan) => sum + loan.getValue(), 0);

    // 5. Calcular concentração com 2 casas decimais
    const concentration = totalValue === 0 
      ? 0 
      : Math.round((stateValue / totalValue) * 100 * 100) / 100;

    // 6. Obter limite para este estado
    const limit = state.getValue() === 'SP' 
      ? CONCENTRATION_LIMITS.SP 
      : CONCENTRATION_LIMITS.default;

    // 7. Retornar DTO
    return {
      state: state.getValue(),
      concentration,
      limit,
      isWithinLimit: concentration <= limit,
      totalValue,
      stateValue
    };
  }
}
