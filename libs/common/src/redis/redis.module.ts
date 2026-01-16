import { DynamicModule, Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { REDIS_OPTIONS } from './redis.constants';
import { RedisModuleOptions } from './redis.interface'; 

@Global()
@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: REDIS_OPTIONS,
          useValue: options,
        },
        RedisService,
      ],
      exports: [RedisService],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<RedisModuleOptions> | RedisModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: REDIS_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        RedisService,
      ],
      exports: [RedisService],
    };
  }
}
