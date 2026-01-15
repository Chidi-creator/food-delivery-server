import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { RiderApprovalStatus } from '../global/common';

export class CreateRiderDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  //before it enters prod do minimum length
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  verificationDocument?: string;
}

export class LoginRiderDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // email or phoneNumber

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UpdateRiderStatusDto {
  @IsEnum(RiderApprovalStatus)
  @IsNotEmpty()
  status: RiderApprovalStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateRiderLocationDto {
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;
}

export class UpdateRiderProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  verificationDocument?: string;
}

