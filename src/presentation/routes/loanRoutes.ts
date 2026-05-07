import { Router } from 'express';
import { LoanController } from '../controllers/LoanController';
import { CreateLoanUseCase } from '../../application/use-cases/CreateLoanUseCase';
import { GetStateLoanConcentrationUseCase } from '../../application/use-cases/GetStateLoanConcentrationUseCase';
import { MongoLoanRepository } from '../../infrastructure/repositories/MongoLoanRepository';

const router = Router();

// Inicializar dependências
const loanRepository = new MongoLoanRepository();
const createLoanUseCase = new CreateLoanUseCase(loanRepository);
const getStateLoanConcentrationUseCase = new GetStateLoanConcentrationUseCase(loanRepository);
const loanController = new LoanController(createLoanUseCase, getStateLoanConcentrationUseCase);

// Rotas
router.post('/loans', (req, res) => loanController.create(req, res));
router.get('/loans/concentration/:state', (req, res) => loanController.getConcentration(req, res));

export default router;
