import { State } from '../../../domain/value-objects/State';

describe('State (Value Object)', () => {
  describe('create', () => {
    it('deve criar um State válido com UF válida', () => {
      const state = State.create('SP');
      expect(state.getValue()).toBe('SP');
    });

    it('deve aceitar UF em minúscula e converter para maiúscula', () => {
      const state = State.create('sp');
      expect(state.getValue()).toBe('SP');
    });

    it('deve validar que apenas UFs brasileiras são aceitas', () => {
      expect(() => State.create('XX')).toThrow('Estado inválido');
    });

    it('deve lançar erro quando UF não tem 2 caracteres', () => {
      expect(() => State.create('S')).toThrow();
      expect(() => State.create('SPP')).toThrow();
    });

    it('deve aceitar todas as 27 UFs brasileiras válidas', () => {
      const validStates = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ];

      validStates.forEach(uf => {
        const state = State.create(uf);
        expect(state.getValue()).toBe(uf);
      });
    });
  });

  describe('equals', () => {
    it('deve comparar dois States iguais corretamente', () => {
      const state1 = State.create('SP');
      const state2 = State.create('SP');
      expect(state1.equals(state2)).toBe(true);
    });

    it('deve comparar dois States diferentes corretamente', () => {
      const state1 = State.create('SP');
      const state2 = State.create('RJ');
      expect(state1.equals(state2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('deve retornar a UF como string', () => {
      const state = State.create('MG');
      expect(state.toString()).toBe('MG');
    });
  });
});
