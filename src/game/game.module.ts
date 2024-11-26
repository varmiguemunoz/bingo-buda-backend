import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameController } from './game.controller';

import { FacGame } from 'src/entities/fac-game.entity';
import { FacGameState } from 'src/entities/fac-gamestate.entity';
import { FacBall } from 'src/entities/fac-ball.entity';
import { FacUsuarios } from 'src/entities/fac-usuarios.entity';
import { BingoCard } from 'src/entities/dim-bingo.entity';
import { DimRooms } from 'src/entities/dim-rooms.entity';
import { WebsocketGateway } from 'src/websockets/websocket.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FacGame,
      FacGameState,
      FacBall,
      FacUsuarios,
      BingoCard,
      DimRooms,
    ]),
  ],
  providers: [GameService, WebsocketGateway],
  controllers: [GameController],
})
export class GameModule {}
