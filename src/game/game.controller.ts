import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GameService } from './game.service';
import { FacGame } from 'src/entities/fac-game.entity';
import { FacBall } from 'src/entities/fac-ball.entity';
import { FacUsuarios } from 'src/entities/fac-usuarios.entity';

@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('game')
@ApiTags('Game')
export class GameController {
  constructor(private gameService: GameService) {}

  // Obtener todos los juegos ✅
  @Get()
  async getAllGames(): Promise<FacGame[]> {
    return await this.gameService.getAllGames();
  }

  // Obtener un juego por su id ✅
  @Get(':id')
  async getGameById(@Param('id') gameId: number): Promise<FacGame> {
    return await this.gameService.getGameById(gameId);
  }

  // Obtener los usuarios en una partida ✅
  @Get(':id/users')
  async getUsersInGame(@Param('id') gameId: number): Promise<FacUsuarios[]> {
    return await this.gameService.getUsersInGame(gameId);
  }

  // Crear un nuevo juego ✅
  @Post()
  async createGame(): Promise<FacGame> {
    return await this.gameService.createGame();
  }

  // Método para que el usuario se una a un juego ✅
  @Post(':gameId/join/:userId')
  async joinGame(
    @Param('gameId') gameId: number,
    @Param('userId') userId: number,
  ): Promise<FacGame> {
    return await this.gameService.joinGame(gameId, userId);
  }

  // Iniciar el juego ✅
  @Post(':id/start')
  async startGame(@Param('id') gameId: number): Promise<FacGame> {
    return await this.gameService.startGame(gameId);
  }

  // Extraer balota ✅
  @Patch(':gameId/draw-ball')
  async drawBall(
    @Param('gameId', ParseIntPipe) gameId: number,
  ): Promise<FacBall> {
    return await this.gameService.drawBall(gameId);
  }

  // Obtener las balotas de un juego ✅
  @Get(':gameId/bingo-balls')
  async getBingoBalls(@Param('gameId') gameId: number) {
    return await this.gameService.getBingoBalls(gameId);
  }

  // Obtener la tarjeta de bingo del usuario ✅
  @Get(':gameId/card/:userId')
  async getBingoCard(
    @Param('userId') userId: number,
    @Param('gameId') gameId: number,
  ) {
    const bingoCard = await this.gameService.getBingoCard(userId, gameId);
    return bingoCard;
  }

  // Comprobar si un jugador ha ganado ✅
  @Get(':gameId/check-bingo/:userId')
  async checkBingo(
    @Param('gameId') gameId: number,
    @Param('userId') userId: number,
  ): Promise<{ hasBingo: boolean }> {
    const hasBingo = await this.gameService.checkBingo(gameId, userId);
    return { hasBingo };
  }

  // Finalizar el juego ✅
  @Post(':id/end')
  async endGame(@Param('id') gameId: number): Promise<string> {
    return await this.gameService.endGame(gameId);
  }
}
