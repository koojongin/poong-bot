import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  username: { type: String },
  id: { type: String, unique: true },
  avatar: String,
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

// userSchema.virtual('enhancedWeapon', {
//   ref: 'EnhancedWeapon',
//   localField: 'userId',
//   foreignField: 'userId',
//   justOne: true,
// });
// userSchema.set('toObject', { virtuals: true });
// userSchema.set('toJSON', {
//   virtuals: true,
//   transform(doc, ret) {
//     delete ret.host;
//     delete ret.userAgent;
//     delete ret.email;
//     delete ret.ip;
//     delete ret.__v;
//     return ret;
//   },
// });

export const User = model('User', userSchema);
