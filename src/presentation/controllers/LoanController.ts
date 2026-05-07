import { Request, Response } from 'express';
import { CreateLoanUseCase } from '../../application/use-cases/CreateLoanUseCase';
import { GetStateLoanConcentrationUseCase } from '../../application/use-cases/GetStateLoanConcentrationUseCase';
import { CreateLoanDTO } from '../../application/dtos/CreateLoanDTO';

export class LoanController {
  constructor(
    private createLoanUseCase: CreateLoanUseCase,
    private getStateLoanConcentrationUseCase: GetStateLoanConcentrationUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const input: CreateLoanDTO = req.body;

      // Validações básicas
      if (!input.value || !input.state) {
        res.status(400).json({
          error: 'Campos obrigatórios: value e state'
        });
        return;
      }

      if (typeof input.value !== 'number' || input.value <= 0) {
        res.status(400).json({
          error: 'Value deve ser um número maior que zero'
        });
        return;
      }

      if (typeof input.state !== 'string' || input.state.length !== 2) {
        res.status(400).json({
          error: 'State deve ser uma UF válida (2 caracteres)'
        });
        return;
      }

      const loanDTO = await this.createLoanUseCase.execute(input);
      res.status(201).json(loanDTO);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({ error: message });
    }
  }

  async getConcentration(req: Request, res: Response): Promise<void> {
    try {
      const { state } = req.params;

      //validação básica do parâmetro state
      if (!state || typeof state !== 'string') {
        res.status(400).json({
          error: 'State é obrigatório e deve ser uma string'
        });
        return;
      }

      const concentrationDTO = await this.getStateLoanConcentrationUseCase.execute(state);
      res.status(200).json(concentrationDTO);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({ error: message });
    }
  }
}
