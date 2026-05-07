import { Loan } from '../../../domain/entities/Loan';
import { State } from '../../../domain/value-objects/State';

describe('Loan (Entity)', () => {
  describe('create', () => {
    it('deve criar um empréstimo válido', () => {
      const state = State.create('SP');
      const loan = Loan.create('123', 50000, state);

      expect(loan.getId()).toBe('123');
      expect(loan.getValue()).toBe(50000);
      expect(loan.getState().equals(state)).toBe(true);
      expect(loan.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('deve lançar erro quando valor é zero', () => {
      const state = State.create('RJ');
      expect(() => Loan.create('123', 0, state)).toThrow('maior que zero');
    });

    it('deve lançar erro quando valor é negativo', () => {
      const state = State.create('MG');
      expect(() => Loan.create('123', -100, state)).toThrow('maior que zero');
    });

    it('deve criar empréstimo com timestamp automático', () => {
      const state = State.create('BA');
      const beforeCreation = new Date();
      const loan = Loan.create('456', 100000, state);
      const afterCreation = new Date();

      const createdAt = loan.getCreatedAt();
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('reconstruct', () => {
    it('deve reconstruir um empréstimo a partir de propriedades', () => {
      const state = State.create('SP');
      const createdDate = new Date('2026-05-07');

      const loan = Loan.reconstruct({
        id: '789',
        value: 75000,
        state,
        createdAt: createdDate
      });

      expect(loan.getId()).toBe('789');
      expect(loan.getValue()).toBe(75000);
      expect(loan.getState().equals(state)).toBe(true);
      expect(loan.getCreatedAt()).toEqual(createdDate);
    });
  });

  describe('getters', () => {
    it('deve retornar corretamente todos os valores', () => {
      const id = '999';
      const value = 125000;
      const state = State.create('SC');
      const loan = Loan.create(id, value, state);

      expect(loan.getId()).toBe(id);
      expect(loan.getValue()).toBe(value);
      expect(loan.getState()).toBe(state);
      expect(loan.getCreatedAt()).toBeInstanceOf(Date);
    });
  });
});
