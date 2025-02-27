import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения до импорта других модулей
const result = dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (result.error) {
  console.error('Ошибка при загрузке .env файла:', result.error);
  process.exit(1);
}

console.log('Переменные окружения загружены');

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import uploadRoutes from './routes/upload';
import userRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
  res.send('API работает!');
});

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialpet')
  .then(() => console.log('Подключено к MongoDB'))
  .catch((error) => console.error('Ошибка подключения к MongoDB:', error));

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 