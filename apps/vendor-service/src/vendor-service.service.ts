import {
  CustomRpcException,
  internationalisePhoneNumber,
  IVendor,
  ServiceName,
  UserRole,
  Vendor,
  VendorApprovalStatus,
} from '@chidi-food-delivery/common';
import { CreateVendorDto } from '@chidi-food-delivery/common/dto/vendor-dto';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { VendorsRepository } from './vendor.repository';
import { Types } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MessagePatterns } from '@chidi-food-delivery/common/global/MessagePattern';

@Injectable()
export class VendorServiceService {
  private readonly logger = new Logger(VendorServiceService.name);

  constructor(
    @Inject(ServiceName.USER_SERVICE)
    private readonly userServiceClient: ClientProxy,
    private readonly vendorsRepository: VendorsRepository,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createVendor({
    userId,
    name,
    address,
    logoUrl,
    imageUrl,
    approvalStatus,
    location,
    phoneNumber,
    email,
  }: CreateVendorDto): Promise<IVendor> {
    const formattedPhoneNumber = internationalisePhoneNumber(phoneNumber);

    // Check if vendor already exists (by name, email)
    await this.checkExistingVendor(name, email);

    // Transform location if it's just an array [lng, lat] to GeoJSON format
    const formattedLocation = Array.isArray(location)
      ? { type: 'Point' as const, coordinates: location as unknown as  [number, number] }
      : location;

    const vendorPayload: Partial<Vendor> = {
      userId: new Types.ObjectId(userId),
      name,
      address,
      logoUrl,
      approvalStatus: approvalStatus || VendorApprovalStatus.PENDING,
      imageUrl,
      location: formattedLocation,
      phoneNumber: formattedPhoneNumber,
      email,
    };

    try {
      const vendor = await this.vendorsRepository.create(vendorPayload);

      // Update user role to include VENDOR
      await firstValueFrom(
        this.userServiceClient.send(
          MessagePatterns.USER_SERVICE.UPDATE_USER_ROLE,
          { userId: userId, role: UserRole.VENDOR },
        ),
      ).catch((error) => {
        // Log error but don't fail vendor creation
        this.logger.error(
          `Failed to update user role for userId ${userId}: ${error.message}`,
        );
      });

      return vendor;
    } catch (error) {
      throw new CustomRpcException(
        `Failed to create vendor: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        ServiceName.VENDOR_SERVICE,
      );
    }
  }

  async getVendorByUserId(userId: Types.ObjectId): Promise<IVendor | null> {
    try {
      // Verify user exists first
      const userResponse = await firstValueFrom(
        this.userServiceClient.send(
          MessagePatterns.USER_SERVICE.GET_PROFILE,
          userId.toString(),
        ),
      );

      if (!userResponse || !userResponse.data) {
        throw new CustomRpcException(
          'User not found.',
          HttpStatus.NOT_FOUND,
          ServiceName.VENDOR_SERVICE,
        );
      }

      // Fetch vendor from database
      const vendor = await this.vendorsRepository.findOne({ userId });

      if (!vendor) {
        throw new CustomRpcException(
          'Vendor not found for the given user ID.',
          HttpStatus.NOT_FOUND,
          ServiceName.VENDOR_SERVICE,
        );
      }

      return vendor;
    } catch (error) {
      // Re-throw CustomRpcException without wrapping
      if (error instanceof CustomRpcException) {
        throw error;
      }

      // Wrap unexpected errors
      throw new CustomRpcException(
        `Failed to fetch vendor by user ID: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        ServiceName.VENDOR_SERVICE,
      );
    }
  }

  async getVendorById(id: Types.ObjectId): Promise<IVendor | null> {
    try {
      const vendor = await this.vendorsRepository.findOne({ _id: id });
      if (!vendor) {
        throw new CustomRpcException(
          'Vendor not found with the given ID',
          HttpStatus.NOT_FOUND,
          ServiceName.VENDOR_SERVICE,
        );
      }
      return vendor;
    } catch (error) {
      throw new CustomRpcException(
        `Failed to fetch vendor: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        ServiceName.VENDOR_SERVICE,
      );
    }
  }

  private async checkExistingVendor(
    name: string,
    email: string,
  ): Promise<void> {
    // Check for existing vendor by name
    const existingByName = await this.vendorsRepository.findOne({ name });
    if (existingByName) {
      throw new CustomRpcException(
        `Vendor with name "${name}" already exists.`,
        HttpStatus.CONFLICT,
        ServiceName.VENDOR_SERVICE,
      );
    }

    // Check for existing vendor by email
    const existingByEmail = await this.vendorsRepository.findOne({ email });
    if (existingByEmail) {
      throw new CustomRpcException(
        'A vendor with this email already exists.',
        HttpStatus.CONFLICT,
        ServiceName.VENDOR_SERVICE,
      );
    }
  }
}
