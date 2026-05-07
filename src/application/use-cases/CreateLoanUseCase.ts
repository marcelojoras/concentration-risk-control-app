import { Loan } from '../../domain/entities/Loan';
import { State } from '../../domain/value-objects/State';
import { ConcentrationValidator } from '../../domain/services/ConcentrationValidator';
import { ILoanRepository } from '../../domain/repositories/LoanRepository';
import { CreateLoanDTO } from '../dtos/CreateLoanDTO';
import { LoanResponseDTO } from '../dtos/LoanResponseDTO';
import { Types } from 'mongoose';

export class CreateLoanUseCase {
  constructor(private loanRepository: ILoanRepository) {}

  async execute(input: CreateLoanDTO): Promise<LoanResponseDTO> {
    // 1. Validar e criar o Value Object State
    const state = State.create(input.state);

    // 2. Buscar todos os empréstimos existentes
    const existingLoans = await this.loanRepository.findAll();

    // 3. Validar regras de concentração
    const validationResult = ConcentrationValidator.validate(
      input.value,
      state,
      existingLoans
    );

    if (!validationResult.isValid) {
      throw new Error(
        `Limite de concentração para ${state.getValue()} seria excedido. ` +
        `Concentração: ${validationResult.currentConcentration.toFixed(2)}% ` +
        `(Limite: ${validationResult.limit}%)`
      );
    }

    // 4. Criar a entidade Loan com um ObjectId válido do MongoDB
    const loan = Loan.create(
      new Types.ObjectId().toString(),
      input.value,
      state
    );

    // 5. Persistir no banco de dados
    await this.loanRepository.save(loan);

    // 6. Retornar DTO
    return this.toLoanResponseDTO(loan);
  }

  private toLoanResponseDTO(loan: Loan): LoanResponseDTO {
    return {
      id: loan.getId(),
      value: loan.getValue(),
      state: loan.getState().getValue(),
      createdAt: loan.getCreatedAt().toISOString()
    };
  }
}
