import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { RiderRepository } from './rider.repostory';
import * as bcrypt from 'bcrypt';
import {
  CreateRiderDto,
  CustomRpcException,
  internationalisePhoneNumber,
  LoginRiderDto,
  ServiceName,
  Rider,
  NotificationMessage,
  NotificationType,
  RiderApprovalStatus,
  UpdateRiderLocationDto,
  UpdateRiderStatusDto,
  UpdateRiderProfileDto,
} from '@chidi-food-delivery/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Types } from 'mongoose';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';

@Injectable()
export class RiderServiceService {
  private readonly logger = new Logger(RiderServiceService.name);

  constructor(
    private readonly riderRepository: RiderRepository,
    @Inject(ServiceName.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
  ) {}

  async createRider({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    profileImage,
    verificationDocument,
  }: CreateRiderDto): Promise<Rider> {
    const formattedPhoneNumber = internationalisePhoneNumber(phoneNumber);
    await this.checkExistingRider(phoneNumber, email);

    const payload: Partial<Rider> = {
      email,
      phoneNumber: formattedPhoneNumber,
      password: await bcrypt.hash(password, 10),
      firstName,
      lastName,
      profileImage,
      verificationDocument,
      isVerified: false,
      acc_status: RiderApprovalStatus.PENDING,
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
    };

    try {
      const rider = await this.riderRepository.create(payload);

      // Send welcome notification after successful rider registration
      this.sendWelcomeNotification(rider);

      return rider;
    } catch (error) {
      this.logger.error('Failed to create rider:', error);
      throw new CustomRpcException(
        'Failed to create rider.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ServiceName.RIDER_SERVICE,
      );
    }
  }

  async getRiderById(riderId: Types.ObjectId): Promise<Rider | null> {
    try {
      const rider = await this.riderRepository.findById(riderId);
      return rider;
    } catch (error) {
      this.logger.error(`Failed to get rider by ID ${riderId}:`, error);
      throw new CustomRpcException(
        'Failed to get rider by ID.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ServiceName.RIDER_SERVICE,
      );
    }
  }

  async getRiderProfile(id: string): Promise<Rider> {
    try {
      const profile = await this.riderRepository.findOne({
        _id: new Types.ObjectId(id),
      });

      if (profile === null) {
        throw new CustomRpcException(
          'No rider found with the given ID',
          HttpStatus.NOT_FOUND,
          ServiceName.RIDER_SERVICE,
        );
      }

      profile.password = '';
      return profile;
    } catch (error) {
      this.logger.error(`Failed to fetch rider profile ${id}:`, error);

      if (error instanceof RpcException) {
        throw error;
      } else {
        throw new CustomRpcException(
          'Failed to fetch rider profile',
          HttpStatus.INTERNAL_SERVER_ERROR,
          ServiceName.RIDER_SERVICE,
        );
      }
    }
  }

  async validateRider(data: LoginRiderDto): Promise<Rider | null> {
    try {
      const { identifier, password } = data;
      const rider: Rider | null = await this.riderRepository.findOne({
        $or: [{ email: identifier }, { phoneNumber: identifier }],
      });

      if (!rider) {
        throw new CustomRpcException(
          'Rider not found.',
          HttpStatus.NOT_FOUND,
          ServiceName.RIDER_SERVICE,
        );
      }

      const isPasswordValid = await bcrypt.compare(password, rider.password);
      if (!isPasswordValid) {
        throw new CustomRpcException(
          'Invalid credentials.',
          HttpStatus.UNAUTHORIZED,
          ServiceName.RIDER_SERVICE,
        );
      }

      // Check if rider is approved
      // if (rider.acc_status !== RiderApprovalStatus.APPROVED) {
      //   throw new CustomRpcException(
      //     `Account is ${rider.acc_status}. Please wait for approval.`,
      //     HttpStatus.FORBIDDEN,
      //     ServiceName.RIDER_SERVICE,
      //   );
      // }

      return rider;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      } else {
        this.logger.error('Unexpected error during rider validation:', error);
        throw new CustomRpcException(
          'An unexpected error occurred during rider validation.',
          HttpStatus.INTERNAL_SERVER_ERROR,
          ServiceName.RIDER_SERVICE,
        );
      }
    }
  }

  async updateRiderStatus(
    riderId: string,
    statusData: UpdateRiderStatusDto,
  ): Promise<Rider> {
    try {
      if (!Types.ObjectId.isValid(riderId)) {
        throw new CustomRpcException(
          'Invalid rider ID.',
          HttpStatus.BAD_REQUEST,
          ServiceName.RIDER_SERVICE,
        );
      }

      const rider = await this.riderRepository.findOne({
        _id: new Types.ObjectId(riderId),
      });

      if (!rider) {
        throw new CustomRpcException(
          'Rider not found.',
          HttpStatus.NOT_FOUND,
          ServiceName.RIDER_SERVICE,
        );
      }

      const updatedRider = await this.riderRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(riderId) },
        { acc_status: statusData.status },
      );

      if (!updatedRider) {
        throw new CustomRpcException(
          'Failed to update rider status.',
          HttpStatus.INTERNAL_SERVER_ERROR,
          ServiceName.RIDER_SERVICE,
        );
      }

      // Send notification about status change
      this.sendStatusChangeNotification(updatedRider, statusData.status, statusData.reason);

      this.logger.log(`Rider ${riderId} status updated to ${statusData.status}`);
      return updatedRider;
    } catch (error) {
      this.logger.error(`Failed to update rider status ${riderId}:`, error);

      if (error instanceof RpcException) {
        throw error;
      }

      throw new CustomRpcException(
        'Failed to update rider status.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ServiceName.RIDER_SERVICE,
      );
    }
  }

  async updateRiderLocation(
    riderId: string,
    locationData: UpdateRiderLocationDto,
  ): Promise<Rider> {
    try {
      if (!Types.ObjectId.isValid(riderId)) {
        throw new CustomRpcException(
          'Invalid rider ID.',
          HttpStatus.BAD_REQUEST,
          ServiceName.RIDER_SERVICE,
        );
      }

      const updatedRider = await this.riderRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(riderId) },
        {
          location: {
            type: 'Point',
            coordinates: [locationData.longitude, locationData.latitude],
          },
        },
      );

      if (!updatedRider) {
        throw new CustomRpcException(
          'Rider not found.',
          HttpStatus.NOT_FOUND,
          ServiceName.RIDER_SERVICE,
        );
      }

      this.logger.log(`Rider ${riderId} location updated`);
      return updatedRider;
    } catch (error) {
      this.logger.error(`Failed to update rider location ${riderId}:`, error);

      if (error instanceof RpcException) {
        throw error;
      }

      throw new CustomRpcException(
        'Failed to update rider location.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ServiceName.RIDER_SERVICE,
      );
    }
  }

  async updateRiderProfile(
    riderId: string,
    profileData: UpdateRiderProfileDto,
  ): Promise<Rider> {
    try {
      if (!Types.ObjectId.isValid(riderId)) {
        throw new CustomRpcException(
          'Invalid rider ID.',
          HttpStatus.BAD_REQUEST,
          ServiceName.RIDER_SERVICE,
        );
      }

      const updatedRider = await this.riderRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(riderId) },
        profileData,
      );

      if (!updatedRider) {
        throw new CustomRpcException(
          'Rider not found.',
          HttpStatus.NOT_FOUND,
          ServiceName.RIDER_SERVICE,
        );
      }

      this.logger.log(`Rider ${riderId} profile updated`);
      return updatedRider;
    } catch (error) {
      this.logger.error(`Failed to update rider profile ${riderId}:`, error);

      if (error instanceof RpcException) {
        throw error;
      }

      throw new CustomRpcException(
        'Failed to update rider profile.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ServiceName.RIDER_SERVICE,
      );
    }
  }

  async getAvailableRiders(): Promise<Rider[]> {
    try {
      const riders = await this.riderRepository.find({
        acc_status: RiderApprovalStatus.APPROVED,
        isVerified: true,
      });

      return riders;
    } catch (error) {
      this.logger.error('Failed to get available riders:', error);
      throw new CustomRpcException(
        'Failed to get available riders.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ServiceName.RIDER_SERVICE,
      );
    }
  }

  async getNearbyRiders(latitude: number, longitude: number, maxDistance: number = 5000): Promise<Rider[]> {
    try {
      // Find riders within maxDistance meters
      const riders = await this.riderRepository.find({
        acc_status: RiderApprovalStatus.APPROVED,
        isVerified: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: maxDistance,
          },
        },
      });

      return riders;
    } catch (error) {
      this.logger.error('Failed to get nearby riders:', error);
      throw new CustomRpcException(
        'Failed to get nearby riders.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ServiceName.RIDER_SERVICE,
      );
    }
  }

  private async checkExistingRider(
    phoneNumber: string,
    email: string,
  ): Promise<void> {
    const existingPhone = await this.riderRepository.findOne({ phoneNumber });
    const existingEmail = await this.riderRepository.findOne({ email });

    if (existingPhone !== null) {
      throw new CustomRpcException(
        'Phone Number is already registered.',
        HttpStatus.CONFLICT,
        ServiceName.RIDER_SERVICE,
      );
    }

    if (existingEmail !== null) {
      throw new CustomRpcException(
        'Email is already registered.',
        HttpStatus.CONFLICT,
        ServiceName.RIDER_SERVICE,
      );
    }
  }

  private async sendWelcomeNotification(rider: Rider): Promise<void> {
    try {
      const notificationPayload: NotificationMessage = {
        type: NotificationType.EMAIL,
        recipient: rider.email,
        event: 'rider_registered',
        subject: 'Welcome to Chidi Food Delivery - Rider Team!',
        text: `Hello ${rider.firstName},\n\nThank you for registering as a rider with Chidi Food Delivery. Your application is currently under review.\n\nYou will receive an email once your account has been approved.\n\nBest regards,\nChidi Food Delivery Team`,
      };

      this.notificationClient.emit(
        MessagePatterns.NOTIFICATION_SERVICE.SEND_NOTIFICATION,
        notificationPayload,
      );

      this.logger.log(`Welcome notification sent to ${rider.email}`);
    } catch (error) {
      this.logger.warn(
        `Failed to send welcome notification to ${rider.email}:`,
        error,
      );
    }
  }

  private async sendStatusChangeNotification(
    rider: Rider,
    status: RiderApprovalStatus,
    reason?: string,
  ): Promise<void> {
    try {
      let subject = '';
      let message = '';

      switch (status) {
        case RiderApprovalStatus.APPROVED:
          subject = 'Your Rider Application Has Been Approved!';
          message = `Hello ${rider.firstName},\n\nCongratulations! Your rider application has been approved. You can now start accepting delivery requests.\n\nBest regards,\nChidi Food Delivery Team`;
          break;
        case RiderApprovalStatus.REJECTED:
          subject = 'Rider Application Update';
          message = `Hello ${rider.firstName},\n\nWe regret to inform you that your rider application has been rejected.\n\n${reason ? `Reason: ${reason}` : ''}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nChidi Food Delivery Team`;
          break;
        case RiderApprovalStatus.PENDING:
          subject = 'Rider Application Under Review';
          message = `Hello ${rider.firstName},\n\nYour rider application is currently under review.\n\nBest regards,\nChidi Food Delivery Team`;
          break;
      }

      const notificationPayload: NotificationMessage = {
        type: NotificationType.EMAIL,
        recipient: rider.email,
        event: 'rider_status_changed',
        subject,
        text: message,
      };

      this.notificationClient.emit(
        MessagePatterns.NOTIFICATION_SERVICE.SEND_NOTIFICATION,
        notificationPayload,
      );

      this.logger.log(`Status change notification sent to ${rider.email}`);
    } catch (error) {
      this.logger.warn(
        `Failed to send status change notification to ${rider.email}:`,
        error,
      );
    }
  }

  getHello(): string {
    return 'Rider Service is running!';
  }
}
