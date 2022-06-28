import { model, Schema } from 'mongoose';

export interface IUser {
  username: string;
  id: string;
  avatar: string;
  avatarURL: string;
  discriminator: string;
  createdAt: Date;
  updatedAt: Date;
}
const schema = new Schema<IUser>({
  username: { type: String },
  id: { type: String, unique: true },
  avatar: String,
  avatarURL: String,
  discriminator: String,
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

export const User = model('User', schema);
