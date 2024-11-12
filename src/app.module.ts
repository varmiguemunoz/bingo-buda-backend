import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import database from './config/database';
import app from './config/app';
import auth from './config/auth';

import { WebsocketModule } from './websockets/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [database, app, auth],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.user'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        schema: config.get('database.schema'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migrations/*{.ts,.js}'],
        synchronize: config.get('database.synchronize'),
        migrationsRun: true,
        logging: true,
        ssl: {
          rejectUnauthorized: config.get('database.ssl.rejectUnauthorized'),
        },
      }),
      inject: [ConfigService],
    }),
    WebsocketModule,
    GameModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
