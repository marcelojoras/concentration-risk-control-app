import { VALID_STATES, ValidState } from '../config/constants';

export class State {
  private readonly value: ValidState;

  private constructor(value: ValidState) {
    this.value = value;
  }

  static create(uf: string): State {
    const upperUf = uf.toUpperCase();

    if (!VALID_STATES.includes(upperUf as ValidState)) {
      throw new Error(`Estado inválido: ${uf}. Use uma UF brasileira válida.`);
    }

    return new State(upperUf as ValidState);
  }

  getValue(): ValidState {
    return this.value;
  }

  equals(other: State): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
