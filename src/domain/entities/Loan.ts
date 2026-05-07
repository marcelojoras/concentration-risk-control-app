import { State } from '../value-objects/State';

export interface LoanProps {
  id: string;
  value: number;
  state: State;
  createdAt: Date;
}

export class Loan {
  private readonly id: string;
  private readonly value: number;
  private readonly state: State;
  private readonly createdAt: Date;

  private constructor(props: LoanProps) {
    this.id = props.id;
    this.value = props.value;
    this.state = props.state;
    this.createdAt = props.createdAt;
  }

  static create(id: string, value: number, state: State): Loan {
    if (value <= 0) {
      throw new Error('O valor do empréstimo deve ser maior que zero.');
    }

    return new Loan({
      id,
      value,
      state,
      createdAt: new Date()
    });
  }

  static reconstruct(props: LoanProps): Loan {
    return new Loan(props);
  }

  getId(): string {
    return this.id;
  }

  getValue(): number {
    return this.value;
  }

  getState(): State {
    return this.state;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
