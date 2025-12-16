import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  CustomRpcException,
  DatabaseException,
  internationalisePhoneNumber,
  LoginUserDto,
  ServiceName,
  User,
  UserNotFoundException,
  NotificationMessage,
  NotificationType,
} from '@chidi-food-delivery/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Types } from 'mongoose';

@Injectable()
export class UserServiceService {
  private readonly logger = new Logger(UserServiceService.name);
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(ServiceName.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
  ) {}

  async createUser({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role,
    verified,
  }: CreateUserDto) {
    const formattedPhoneNumber = internationalisePhoneNumber(phoneNumber);
    await this.checkExistingUser(phoneNumber, email);

    const payload: Partial<User> = {
      email,
      phoneNumber: formattedPhoneNumber,
      password: await bcrypt.hash(password, 10),
      firstName,
      lastName,
      role,
      verified,
    };

    try {
      const user = await this.usersRepository.create(payload);
      
      // Send welcome notification after successful user creation
      this.sendWelcomeNotification(user);
      
      return user;
    } catch (error) {
      throw new CustomRpcException(
        'Failed to create user.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ServiceName.USER_SERVICE,
      );
    }
  }

  async getUserById(userId: Types.ObjectId): Promise<User | any> {
    try {
      const user: User | null = await this.usersRepository.findById(userId);
      return user;
    } catch (error) {
      throw new CustomRpcException(
        'Failed to get user by ID.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        'user-service',
      );
    }
  }

  private async checkExistingUser(
    phoneNumber: string,
    email: string,
  ): Promise<User> {
    const _phone: User | null = await this.usersRepository.findOne({
      phoneNumber,
    });

    const _email: User | null = await this.usersRepository.findOne({ email });

    if (_phone !== null) {
      throw new CustomRpcException(
        'Phone Number is  already registered.',
        HttpStatus.CONFLICT,
        ServiceName.USER_SERVICE,
      );
    }

    if (_email !== null) {
      throw new CustomRpcException(
        'Email is  already registered.',
        HttpStatus.CONFLICT,
        ServiceName.USER_SERVICE,
      );
    }

    return _phone as unknown as User;
  }

  public async getProfile(id: string): Promise<User> {
    try {
      const profile = await this.usersRepository.findOne({
        _id: new Types.ObjectId(id),
      });

      if (profile === null) {
        throw new UserNotFoundException('No profile with the given Id');
      }

      profile.password = '';
      return profile;
    } catch (error) {
      this.logger.error({
        message: `Failed to fetch user profile ${id} `,
        error,
      });

      if (error instanceof RpcException) {
        throw new CustomRpcException(
          'No user found with the given ID',
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        throw new CustomRpcException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async validateUser(data: LoginUserDto): Promise<User | null> {
    try {
      const { identifier, password } = data;
      const user: User | null = await this.usersRepository.findOne({
        $or: [{ email: identifier }, { phoneNumber: identifier }],
      });

      if (!user) {
        throw new UserNotFoundException('User not found.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomRpcException(
          'Invalid credentials.',
          HttpStatus.UNAUTHORIZED,
          ServiceName.USER_SERVICE,
        );
      }

      return user;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      } else {
        throw new CustomRpcException(
          'An unexpected error occurred during user validation.',
          HttpStatus.INTERNAL_SERVER_ERROR,
          ServiceName.USER_SERVICE,
        );
      }
    }
  }

  async addUserRole(userId: string, role: string): Promise<User> {
    try {
      // Validate userId
      if (!Types.ObjectId.isValid(userId)) {
        throw new CustomRpcException(
          'Invalid user ID.',
          HttpStatus.BAD_REQUEST,
          ServiceName.USER_SERVICE,
        );
      }

      // Check if user exists
      const user = await this.usersRepository.findOne({
        _id: new Types.ObjectId(userId),
      });

      if (!user) {
        throw new UserNotFoundException('User not found.');
      }

      // Update user role using $addToSet to prevent duplicates
      const updatedUser = await this.usersRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(userId) },
        { $addToSet: { role } },
      );

      if (!updatedUser) {
        throw new CustomRpcException(
          'Failed to update user role.',
          HttpStatus.INTERNAL_SERVER_ERROR,
          ServiceName.USER_SERVICE,
        );
      }

      this.logger.log(`Role '${role}' added to user ${userId}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to add role to user ${userId}:`, error);

      if (error instanceof RpcException) {
        throw error;
      }

      throw new CustomRpcException(
        'Failed to update user role.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ServiceName.USER_SERVICE,
      );
    }
  }

  private sendWelcomeNotification(user: User): void {
    try {
      const notificationPayload: NotificationMessage = {
        type: NotificationType.EMAIL,
        recipient: user.email,
        event: 'user_registered',
        subject: 'Welcome to Chidi Food Delivery!',
        text: `Hello ${user.firstName},\n\nThank you for registering with Chidi Food Delivery. We're excited to have you on board!\n\nBest regards,\nChidi Food Delivery Team`,
      };
      
      // Emit notification (fire and forget)
      this.notificationClient.emit('user_registered', notificationPayload);
      
      this.logger.log(`Welcome notification sent to ${user.email}`);
    } catch (error) {
      // Don't throw error - notification failure shouldn't break registration
      this.logger.warn(`Failed to send welcome notification to ${user.email}:`, error);
    }
  }
}
