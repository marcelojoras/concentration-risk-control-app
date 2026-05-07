import { CreateLoanUseCase } from '../../../application/use-cases/CreateLoanUseCase';
import { ILoanRepository } from '../../../domain/repositories/LoanRepository';
import { Loan } from '../../../domain/entities/Loan';
import { State } from '../../../domain/value-objects/State';
import { CreateLoanDTO } from '../../../application/dtos/CreateLoanDTO';

class MockLoanRepository implements ILoanRepository {
  private loans: Loan[] = [];

  async save(loan: Loan): Promise<void> {
    this.loans.push(loan);
  }

  async findAll(): Promise<Loan[]> {
    return this.loans;
  }

  async findByState(state: State): Promise<Loan[]> {
    return this.loans.filter(loan => loan.getState().equals(state));
  }

  async getTotalLoansValue(): Promise<number> {
    return this.loans.reduce((sum, loan) => sum + loan.getValue(), 0);
  }
}

describe('CreateLoanUseCase', () => {
  let useCase: CreateLoanUseCase;
  let repository: MockLoanRepository;

  beforeEach(() => {
    repository = new MockLoanRepository();
    useCase = new CreateLoanUseCase(repository);
  });

  it('deve criar um empréstimo válido com sucesso', async () => {
    const input: CreateLoanDTO = {
      value: 50000,
      state: 'SP'
    };

    const result = await useCase.execute(input);

    expect(result.value).toBe(50000);
    expect(result.state).toBe('SP');
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
  });

  it('deve persistir o empréstimo no repositório', async () => {
    const input: CreateLoanDTO = {
      value: 100000,
      state: 'RJ'
    };

    await useCase.execute(input);

    const allLoans = await repository.findAll();
    expect(allLoans).toHaveLength(1);
    expect(allLoans[0].getValue()).toBe(100000);
  });

  it('deve rejeitar empréstimo que viola concentração', async () => {
    // Criar primeiro empréstimo
    await useCase.execute({ value: 100000, state: 'MG' });

    // Tentar adicionar mais ao MG, excedendo 10%
    const input: CreateLoanDTO = {
      value: 50000,
      state: 'MG'
    };

    await expect(useCase.execute(input)).rejects.toThrow('Limite de concentração');
  });

  it('deve rejeitar UF inválida', async () => {
    const input: CreateLoanDTO = {
      value: 50000,
      state: 'XX'
    };

    await expect(useCase.execute(input)).rejects.toThrow('Estado inválido');
  });

  it('deve rejeitar valor negativo ou zero', async () => {
    const input1: CreateLoanDTO = {
      value: 0,
      state: 'SP'
    };

    const input2: CreateLoanDTO = {
      value: -100,
      state: 'SP'
    };

    await expect(useCase.execute(input1)).rejects.toThrow('maior que zero');
    await expect(useCase.execute(input2)).rejects.toThrow('maior que zero');
  });

  it('deve criar múltiplos empréstimos em estados diferentes', async () => {
    // Primeiro empréstimo: sempre válido (sem comparação)
    const loan1 = await useCase.execute({ value: 100000, state: 'SP' });
    
    // Segundo: 10k em RJ = 10k/110k = 9% < 10% ✓
    const loan2 = await useCase.execute({ value: 10000, state: 'RJ' });
    
    // Terceiro: 10k em MG = 10k/120k = 8% < 10% ✓
    const loan3 = await useCase.execute({ value: 10000, state: 'MG' });

    const allLoans = await repository.findAll();
    expect(allLoans).toHaveLength(3);
    expect(loan1.state).toBe('SP');
    expect(loan2.state).toBe('RJ');
    expect(loan3.state).toBe('MG');
  });

  it('deve converter DTO para resposta corretamente', async () => {
    const input: CreateLoanDTO = {
      value: 75000,
      state: 'BA'
    };

    const result = await useCase.execute(input);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('value');
    expect(result).toHaveProperty('state');
    expect(result).toHaveProperty('createdAt');
    expect(result.value).toBe(75000);
    expect(result.state).toBe('BA');
  });
});
