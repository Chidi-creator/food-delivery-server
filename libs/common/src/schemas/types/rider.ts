import {
  LocationCoordinates,
  RiderApprovalStatus,
  UserRole,
} from '@chidi-food-delivery/common/global/common';

export interface IRider {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  isVerified: boolean;
  acc_status: RiderApprovalStatus;
  profileImage: string;
  verificationDocument: string;
  location: LocationCoordinates;
  role: UserRole[];
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
