import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from './abstract.schema';
import { IRider } from './types/rider';
import {
  LocationCoordinates,
  RiderApprovalStatus,
  UserRole,
} from '../global/common';

@Schema({ timestamps: true, versionKey: false })
export class Rider extends AbstractDocument implements IRider {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({
    type: String,
    enum: Object.values(RiderApprovalStatus),
    default: RiderApprovalStatus.PENDING,
  })
  acc_status: RiderApprovalStatus;

  @Prop({ required: false })
  profileImage: string;

  @Prop({ required: false })
  verificationDocument: string;

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
  location: LocationCoordinates;

  @Prop({
    type: [String],
    enum: Object.values(UserRole),
    default: [UserRole.DRIVER],
  })
  role: UserRole[];
}

export const RiderSchema = SchemaFactory.createForClass(Rider);
