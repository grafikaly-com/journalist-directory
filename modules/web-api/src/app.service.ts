import { Injectable } from '@nestjs/common';

// TODO: this is not used yet
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
