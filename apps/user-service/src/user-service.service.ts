import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  CustomRpcException,
  DatabaseException,
  internationalisePhoneNumber,
  ServiceName,
  User,
} from '@chidi-food-delivery/common';
import { RpcException } from '@nestjs/microservices';
import { Types } from 'mongoose';

@Injectable()
export class UserServiceService {
  constructor(private readonly usersRepository: UsersRepository) {}

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
}
