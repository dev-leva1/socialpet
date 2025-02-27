import { Schema, model, Document, Types } from 'mongoose';

interface IComment {
  content: string;
  author: Types.ObjectId;
  createdAt: Date;
}

interface IPost extends Document {
  content: string;
  image?: string;
  author: Types.ObjectId;
  likes: Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new Schema<IPost>({
  content: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema]
}, {
  timestamps: true
});

export const Post = model<IPost>('Post', postSchema);
export type { IPost, IComment }; 