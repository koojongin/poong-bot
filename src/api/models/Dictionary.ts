import { model, Schema } from 'mongoose';
import { IUser } from './User';

export interface IDictionary {
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;

  //virtual fields
  user?: IUser;
}
const schema = new Schema<IDictionary>({
  title: { type: String },
  content: { type: String },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
  userId: { type: String, required: true },
});

schema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: 'id',
  justOne: true,
});

export const Dictionary = model<IDictionary>('Dictionary', schema);
