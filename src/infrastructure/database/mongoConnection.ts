import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI não está definida no arquivo .env');
    }

    await mongoose.connect(mongoUri);
    console.log('✓ Conectado ao MongoDB com sucesso');
  } catch (error) {
    console.error('✗ Erro ao conectar ao MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('✓ Desconectado do MongoDB');
};
