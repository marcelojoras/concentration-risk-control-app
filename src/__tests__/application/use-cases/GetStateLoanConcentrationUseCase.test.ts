import { GetStateLoanConcentrationUseCase } from '../../../application/use-cases/GetStateLoanConcentrationUseCase';
import { ILoanRepository } from '../../../domain/repositories/LoanRepository';
import { Loan } from '../../../domain/entities/Loan';
import { State } from '../../../domain/value-objects/State';

class MockLoanRepository implements ILoanRepository {
  private loans: Loan[] = [];

  addLoan(value: number, state: string): void {
    const loan = Loan.create(Math.random().toString(), value, State.create(state));
    this.loans.push(loan);
  }

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

describe('GetStateLoanConcentrationUseCase', () => {
  let useCase: GetStateLoanConcentrationUseCase;
  let repository: MockLoanRepository;

  beforeEach(() => {
    repository = new MockLoanRepository();
    useCase = new GetStateLoanConcentrationUseCase(repository);
  });

  it('deve retornar concentração 0 quando não há empréstimos', async () => {
    const result = await useCase.execute('SP');

    expect(result.state).toBe('SP');
    expect(result.concentration).toBe(0);
    expect(result.totalValue).toBe(0);
    expect(result.stateValue).toBe(0);
  });

  it('deve retornar concentração correta com um estado', async () => {
    repository.addLoan(100000, 'SP');
    repository.addLoan(400000, 'RJ');

    const result = await useCase.execute('SP');

    expect(result.state).toBe('SP');
    expect(result.concentration).toBe(20);
    expect(result.totalValue).toBe(500000);
    expect(result.stateValue).toBe(100000);
  });

  it('deve retornar limite 20% para São Paulo', async () => {
    repository.addLoan(50000, 'SP');

    const result = await useCase.execute('SP');

    expect(result.limit).toBe(20);
  });

  it('deve retornar limite 10% para outros estados', async () => {
    repository.addLoan(50000, 'MG');

    const result = await useCase.execute('MG');

    expect(result.limit).toBe(10);
  });

  it('deve indicar se está dentro do limite', async () => {
    // Distribuir para que todos estejam dentro dos limites
    repository.addLoan(100000, 'SP');  // SP: 100k / 500k = 20% (limite 20%) ✓
    repository.addLoan(100000, 'RJ');  // RJ: 100k / 500k = 20% (limite 10%) ✗
    repository.addLoan(100000, 'MG');  // MG: 100k / 500k = 20% (limite 10%) ✗
    repository.addLoan(100000, 'BA');  // BA: 100k / 500k = 20% (limite 10%) ✗
    repository.addLoan(100000, 'CE');  // CE: 100k / 500k = 20% (limite 10%) ✗

    const resultSP = await useCase.execute('SP');
    expect(resultSP.isWithinLimit).toBe(true);  // 20% <= 20% ✓

    const resultRJ = await useCase.execute('RJ');
    expect(resultRJ.isWithinLimit).toBe(false); // 20% > 10% ✗
  });

  it('deve indicar se excede o limite', async () => {
    repository.addLoan(100000, 'MG');

    const result = await useCase.execute('MG');

    expect(result.isWithinLimit).toBe(false); // 100% > 10%
  });

  it('deve retornar concentração com 2 casas decimais', async () => {
    repository.addLoan(333333, 'SP');
    repository.addLoan(666667, 'RJ');

    const result = await useCase.execute('SP');

    // 333.333 / 1.000.000 = 33.3333...
    // Com 2 casas: 33.33
    expect(result.concentration).toBe(33.33);
  });

  it('deve rejeitar UF inválida', async () => {
    await expect(useCase.execute('XX')).rejects.toThrow('Estado inválido');
  });

  it('deve consultar concentração com múltiplos estados', async () => {
    repository.addLoan(100000, 'SP');
    repository.addLoan(100000, 'RJ');
    repository.addLoan(100000, 'MG');
    repository.addLoan(100000, 'BA');

    const resultSP = await useCase.execute('SP');
    const resultRJ = await useCase.execute('RJ');

    expect(resultSP.concentration).toBe(25);
    expect(resultRJ.concentration).toBe(25);
    expect(resultSP.totalValue).toBe(400000);
  });

  it('deve retornar valores totais corretos', async () => {
    repository.addLoan(250000, 'SP');
    repository.addLoan(750000, 'RJ');

    const result = await useCase.execute('SP');

    expect(result.stateValue).toBe(250000);
    expect(result.totalValue).toBe(1000000);
    expect(result.concentration).toBe(25);
  });
});
