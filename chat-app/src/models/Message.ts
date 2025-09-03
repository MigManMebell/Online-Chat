import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  sender: {
    userId: Types.ObjectId;
    nickname: string;
  };
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    content: { type: String, required: true },
    sender: {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      nickname: { type: String, required: true },
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Message: Model<IMessage> =
  (mongoose.models.Message as Model<IMessage>) ||
  mongoose.model<IMessage>('Message', MessageSchema);


