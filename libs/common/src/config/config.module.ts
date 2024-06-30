import { Module } from '@nestjs/common';
import {
  ConfigService,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import * as joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        MONGO_URI: joi.string().required(),
        JWT_SECRET: joi.string().required(),
        JWT_EXPIRES_IN: joi.string().required(),
        ALLOWED_ORIGINS: joi.string().required(),
        PORT: joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
