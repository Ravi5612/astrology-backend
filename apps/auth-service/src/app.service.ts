import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  login(credential: { username: string; password: string }) {
    console.log(credential);
    return credential;
  }
}
