import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from './abstract.schema';
import { IUser } from './types/user';
import { LocationCoordinates, UserRole } from '../global/common';

@Schema({ timestamps: true, versionKey: false })
export class User extends AbstractDocument implements IUser {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: false })
  verified: boolean;
  
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  })
  lastlocation?: LocationCoordinates;

  @Prop({
    type: [String],
    enum: Object.values(UserRole),
    default: [UserRole.CUSTOMER],
  })
  role: UserRole[];

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });

UserSchema.index({ phoneNumber: 1 }, { unique: true });

UserSchema.index({ deletedAt: 1, email: 1 });
