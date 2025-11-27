import { UserRole } from '../../global/common';

export interface IUser {
  email: string;
  password: string;
  firstName: string;
  phoneNumber: string;
  lastName: string;
  role: UserRole[];
  verified?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}