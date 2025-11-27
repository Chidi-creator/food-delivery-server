import { Body, Controller, Get, Post } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { CreateUserDto } from '@chidi-food-delivery/common';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get()
  getHello(): string {
    return this.gatewayService.getHello();
  }

  @Post('register')
  async registerUser(@Body() body: CreateUserDto) {
    return await this.gatewayService.registerUser(body);
  }
}
