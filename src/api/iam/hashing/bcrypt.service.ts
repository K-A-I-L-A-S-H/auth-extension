import { Injectable } from '@nestjs/common';
import { HashingService } from './hashing.service';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class BcryptService implements HashingService {
  async hash(data: string | Buffer): Promise<string> {
    const salt = await genSalt(10);
    return hash(data, salt);
  }
  async compare(data: string | Buffer, hash: string): Promise<boolean> {
    return compare(data, hash);
  }
}