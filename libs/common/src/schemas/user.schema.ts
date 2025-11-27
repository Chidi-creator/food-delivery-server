import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from './abstract.schema';
import { IUser } from './types/user';
import { UserRole } from '../global/common';

@Schema({ timestamps: true, versionKey: false })
export class User extends AbstractDocument implements IUser {
  @Prop({ 
    required: true,
    unique: true,
    index: true
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ 
    required: true,
    unique: true,
    index: true
  })
  phoneNumber: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: false })
  verified: boolean;

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
