import { Injectable, Logger, Type } from '@nestjs/common';
import { Policy, PolicyHandler } from '../types';

@Injectable()
export class PolicyHandlerStorage {
  private readonly collection = new Map<Type<Policy>, PolicyHandler<any>>();
  private readonly logger = new Logger(PolicyHandlerStorage.name);

  add<T extends Policy>(policyCls: Type<T>, handler: PolicyHandler<T>) {
    this.collection.set(policyCls, handler);
  }

  get<T extends Policy>(policyCls: Type<T>): PolicyHandler<T> | undefined {
    const handler = this.collection.get(policyCls);
    if (!handler) {
      this.logger.error(`"${policyCls?.name}" does not have associated handler`);
    }

    return handler;
  }
}
