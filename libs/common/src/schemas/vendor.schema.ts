import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IVendor } from './types/vendor';
import { Types } from 'mongoose';
import { LocationCoordinates } from '../global/common';
import { AbstractDocument } from './abstract.schema';
import { VendorApprovalStatus } from '../typings/vendorstatus';

@Schema({ timestamps: true, versionKey: false })
export class  Vendor extends AbstractDocument implements IVendor {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true})
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({  default: null })
  logoUrl: string;

  @Prop({ default: null })
  imageUrl: string;

  @Prop({
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  })
  location: LocationCoordinates;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({
    type: String,
    enum: Object.values(VendorApprovalStatus),
    default: VendorApprovalStatus.PENDING,
  })
  approvalStatus: VendorApprovalStatus;

  @Prop({ required: true })
  email: string;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

// Geospatial index for location-based queries (e.g find nearby vendors)
VendorSchema.index({ location: '2dsphere' });
