import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './infrastructure/database/mongoConnection';
import loanRoutes from './presentation/routes/loanRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Rotas
app.use(loanRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();