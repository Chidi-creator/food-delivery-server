import { Injectable } from '@nestjs/common';

@Injectable()
export class VendorServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
