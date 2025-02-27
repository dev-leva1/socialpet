import express from 'express';
import { auth } from '../middleware/auth';
import { User, IUser } from '../models/User';
import { Types } from 'mongoose';

interface AuthRequest extends express.Request {
  user?: {
    _id: string;
    email: string;
    username: string;
  };
}

interface LeanUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  following: Types.ObjectId[];
  followers: Types.ObjectId[];
}

const router = express.Router();

// Получение профиля пользователя по ID
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление профиля
router.put('/profile', auth, async (req: AuthRequest, res) => {
  try {
    const updates = {
      username: req.body.username,
      avatar: req.body.avatar,
      bio: req.body.bio
    };

    // Проверяем, не занято ли имя пользователя
    if (updates.username) {
      const existingUser = await User.findOne({ 
        username: updates.username,
        _id: { $ne: req.user?._id }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Это имя пользователя уже занято' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении профиля' });
  }
});

// Подписка/отписка
router.post('/:id/follow', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const currentUserId = new Types.ObjectId(req.user._id);
    const userToFollowId = new Types.ObjectId(req.params.id);

    if (userToFollowId.equals(currentUserId)) {
      return res.status(400).json({ message: 'Нельзя подписаться на самого себя' });
    }

    const [userToFollow, currentUser] = await Promise.all([
      User.findById(userToFollowId),
      User.findById(currentUserId)
    ]);

    if (!userToFollow) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (!currentUser) {
      return res.status(404).json({ message: 'Текущий пользователь не найден' });
    }

    const isFollowing = currentUser.following.some(id => id.equals(userToFollowId));

    if (isFollowing) {
      // Отписка
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, {
          $pull: { following: userToFollowId }
        }),
        User.findByIdAndUpdate(userToFollowId, {
          $pull: { followers: currentUserId }
        })
      ]);
    } else {
      // Подписка
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, {
          $addToSet: { following: userToFollowId }
        }),
        User.findByIdAndUpdate(userToFollowId, {
          $addToSet: { followers: currentUserId }
        })
      ]);
    }

    const updatedUser = await User.findById(currentUserId)
      .select('-password')
      .populate('following', 'username avatar')
      .populate('followers', 'username avatar');

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении подписки' });
  }
});

export default router; 