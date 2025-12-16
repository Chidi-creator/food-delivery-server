import { LocationCoordinates } from '@chidi-food-delivery/common/global/common';
import { VendorApprovalStatus } from '@chidi-food-delivery/common/typings/vendorstatus';
import { Types } from 'mongoose';

export interface IVendor {
  userId: Types.ObjectId | string;
  name: string;
  address: string;
  logoUrl?: string;
  imageUrl?: string;
  location: LocationCoordinates;
  approvalStatus: VendorApprovalStatus;
  phoneNumber: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}
