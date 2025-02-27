import express from 'express';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import cloudinary from '../config/cloudinary';

const router = express.Router();

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не найден' });
    }

    console.log('Файл получен:', {
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    console.log('Загрузка в Cloudinary...');
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'socialpet'
    });
    console.log('Загрузка успешна:', result.secure_url);

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    res.status(500).json({ 
      message: 'Ошибка при загрузке файла',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
});

export default router; 