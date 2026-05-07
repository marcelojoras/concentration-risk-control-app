import { Loan } from '../entities/Loan';
import { State } from '../value-objects/State';

export interface ILoanRepository {
  save(loan: Loan): Promise<void>;
  findAll(): Promise<Loan[]>;
  findByState(state: State): Promise<Loan[]>;
  getTotalLoansValue(): Promise<number>;
}
