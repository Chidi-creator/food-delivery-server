import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IVendor } from '../schemas/types/vendor';
import { VendorApprovalStatus } from '../typings/vendorstatus';

export class CreateVendorDto implements IVendor {
  @IsOptional()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

 @IsOptional()
  @IsString()
  logoUrl: string;

  @IsOptional()
  @IsEnum(VendorApprovalStatus)
  approvalStatus: VendorApprovalStatus;

 @IsOptional()
  @IsString()
  imageUrl: string;

  
  @IsNotEmpty()
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
