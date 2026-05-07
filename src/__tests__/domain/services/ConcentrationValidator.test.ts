import { ConcentrationValidator } from '../../../domain/services/ConcentrationValidator';
import { Loan } from '../../../domain/entities/Loan';
import { State } from '../../../domain/value-objects/State';

describe('ConcentrationValidator (Domain Service)', () => {
  describe('validate', () => {
    it('deve permitir primeiro empréstimo (sem empréstimos anteriores)', () => {
      const newLoanValue = 100000;
      const newLoanState = State.create('SP');
      const existingLoans: Loan[] = [];

      const result = ConcentrationValidator.validate(newLoanValue, newLoanState, existingLoans);

      expect(result.isValid).toBe(true);
      expect(result.currentConcentration).toBe(100);
    });

    it('deve validar concentração dentro do limite para estado padrão (10%)', () => {
      // Total: 1.000.000 | RJ: 100.000 (10%)
      const rjLoan = Loan.create('1', 100000, State.create('RJ'));
      const existingLoans = [rjLoan];

      const result = ConcentrationValidator.validate(50000, State.create('RJ'), existingLoans);

      // Novo total: 1.150.000 | RJ: 150.000 (13,04%)
      expect(result.isValid).toBe(false); // Excede 10%
      expect(result.currentConcentration).toBeGreaterThan(10);
      expect(result.limit).toBe(10);
    });

    it('deve rejeitar concentração acima do limite para estado padrão (10%)', () => {
      const spLoan = Loan.create('1', 100000, State.create('RJ'));
      const existingLoans = [spLoan];

      const result = ConcentrationValidator.validate(50000, State.create('RJ'), existingLoans);

      // Novo total: 150.000 | RJ: 150.000 (100%)
      expect(result.isValid).toBe(false);
      expect(result.currentConcentration).toBe(100);
      expect(result.limit).toBe(10);
    });

    it('deve permitir até 20% para São Paulo', () => {
      const spLoan = Loan.create('1', 100000, State.create('SP'));
      const otherLoan = Loan.create('2', 400000, State.create('RJ'));
      const existingLoans = [spLoan, otherLoan];

      const result = ConcentrationValidator.validate(100000, State.create('SP'), existingLoans);

      // Total: 600.000 | SP: 200.000 (33,33%)
      expect(result.isValid).toBe(false); // Excede 20%
      expect(result.limit).toBe(20);
    });

    it('deve aceitar exatamente 20% para São Paulo', () => {
      const spLoan = Loan.create('1', 100000, State.create('SP'));
      const otherLoan = Loan.create('2', 400000, State.create('RJ'));
      const existingLoans = [spLoan, otherLoan];

      const result = ConcentrationValidator.validate(0, State.create('SP'), existingLoans);

      // Total: 500.000 | SP: 100.000 (20%)
      expect(result.isValid).toBe(true);
      expect(result.currentConcentration).toBe(20);
      expect(result.limit).toBe(20);
    });

    it('deve distribuir corretamente entre múltiplos estados', () => {
      const loan1 = Loan.create('1', 100000, State.create('SP'));
      const loan2 = Loan.create('2', 100000, State.create('RJ'));
      const loan3 = Loan.create('3', 100000, State.create('MG'));
      const existingLoans = [loan1, loan2, loan3];

      const result = ConcentrationValidator.validate(50000, State.create('RJ'), existingLoans);

      // Total: 350.000 | RJ: 150.000 (42,86%)
      expect(result.isValid).toBe(false);
      expect(result.limit).toBe(10);
    });

    it('deve retornar concentração com valor exato', () => {
      const loan = Loan.create('1', 333333, State.create('SP'));
      const existingLoans = [loan];

      const result = ConcentrationValidator.validate(666667, State.create('SP'), existingLoans);

      // Total: 1.000.000 | SP: 1.000.000 (100%)
      expect(result.isValid).toBe(false);
      expect(result.currentConcentration).toBe(100);
    });
  });
});
