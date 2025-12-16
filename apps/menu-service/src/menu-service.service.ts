import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
