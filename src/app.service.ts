import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Buda Bingo api. Check our documentation here /api/docs';
  }
}
