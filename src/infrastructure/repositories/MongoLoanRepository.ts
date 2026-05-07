import { Loan } from '../../domain/entities/Loan';
import { State } from '../../domain/value-objects/State';
import { ILoanRepository } from '../../domain/repositories/LoanRepository';
import { LoanModel, LoanDocument } from '../database/schemas/LoanSchema';

export class MongoLoanRepository implements ILoanRepository {
  async save(loan: Loan): Promise<void> {
    const loanDocument = new LoanModel({
      _id: loan.getId(),
      value: loan.getValue(),
      state: loan.getState().getValue(),
      createdAt: loan.getCreatedAt()
    });

    await loanDocument.save();
  }

  async findAll(): Promise<Loan[]> {
    const documents = await LoanModel.find();
    return documents.map(doc => this.toDomain(doc));
  }

  async findByState(state: State): Promise<Loan[]> {
    const documents = await LoanModel.find({ state: state.getValue() });
    return documents.map(doc => this.toDomain(doc));
  }

  async getTotalLoansValue(): Promise<number> {
    const result = await LoanModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$value' }
        }
      }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  private toDomain(document: LoanDocument): Loan {
    return Loan.reconstruct({
      id: document._id.toString(),
      value: document.value,
      state: State.create(document.state),
      createdAt: document.createdAt
    });
  }
}
