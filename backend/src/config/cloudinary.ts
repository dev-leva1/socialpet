import { v2 as cloudinary } from 'cloudinary';

console.log('Проверка переменных окружения Cloudinary:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Установлено' : 'Отсутствует',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Установлено' : 'Отсутствует',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Установлено' : 'Отсутствует'
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Отсутствуют необходимые переменные окружения для Cloudinary');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Проверяем конфигурацию
cloudinary.config().cloud_name && console.log('Cloudinary успешно настроен');

export default cloudinary; 