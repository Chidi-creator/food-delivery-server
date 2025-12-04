import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { IUser } from '../schemas/types/user';
import { UserRole } from '../global/common';

//create user dto
export class CreateUserDto implements IUser {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsArray()
  role: UserRole[];

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}

//login user dto

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
