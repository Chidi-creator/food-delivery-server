import { Controller, Get } from '@nestjs/common';
import { MenuServiceService } from './menu-service.service';

@Controller()
export class MenuServiceController {
  constructor(private readonly menuServiceService: MenuServiceService) {}

  @Get()
  getHello(): string {
    return this.menuServiceService.getHello();
  }
}
