import { Schema, model, Document } from 'mongoose';

export interface LoanDocument extends Document {
  value: number;
  state: string;
  createdAt: Date;
}

const LoanSchema = new Schema<LoanDocument>(
  {
    value: {
      type: Number,
      required: [true, 'Valor do empréstimo é obrigatório'],
      min: [0.01, 'Valor deve ser maior que zero']
    },
    state: {
      type: String,
      required: [true, 'Estado (UF) é obrigatório'],
      uppercase: true,
      length: 2
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const LoanModel = model<LoanDocument>('Loan', LoanSchema);
