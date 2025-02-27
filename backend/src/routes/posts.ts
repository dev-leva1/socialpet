import express from 'express';
import { Post, IPost } from '../models/Post';
import { auth } from '../middleware/auth';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Создание поста
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const post = new Post({
      content: req.body.content,
      image: req.body.image,
      author: new Types.ObjectId(req.user._id)
    });

    await post.save();
    await post.populate('author', 'username avatar');
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Ошибка при создании поста:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании поста',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Получение всех постов
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .exec();
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении постов' });
  }
});

// Лайк поста
router.post('/:id/like', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    const userId = new Types.ObjectId(req.user._id);
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => !id.equals(userId));
    } else {
      post.likes.push(userId);
    }

    await post.save();
    await post.populate('author', 'username avatar');
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении лайков' });
  }
});

// Добавление комментария
router.post('/:id/comments', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    post.comments.push({
      content: req.body.content,
      author: new Types.ObjectId(req.user._id),
      createdAt: new Date()
    });

    await post.save();
    await post.populate('author', 'username avatar');
    await post.populate('comments.author', 'username avatar');
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при добавлении комментария' });
  }
});

// Удаление поста
router.delete('/:id', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    if (post.author.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Нет прав на удаление этого поста' });
    }

    await post.deleteOne();
    res.json({ message: 'Пост успешно удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении поста' });
  }
});

export default router; 