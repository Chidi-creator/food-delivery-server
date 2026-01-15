export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  VENDOR = 'vendor',
  DRIVER = 'driver',
}

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}
export interface LocationCoordinates {
  type: 'Point';
  coordinates: [number, number];
}

export interface TokenPayload {
  userId: string;
}

export enum RiderApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}