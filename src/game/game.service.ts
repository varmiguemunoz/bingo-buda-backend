import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FacGame } from 'src/entities/fac-game.entity';
import { FacGameState } from 'src/entities/fac-gamestate.entity';
import { FacBall } from 'src/entities/fac-ball.entity';
import { BingoCard } from 'src/entities/dim-bingo.entity';
import { FacUsuarios } from 'src/entities/fac-usuarios.entity';
import { DimRooms } from 'src/entities/dim-rooms.entity';
import { WebsocketGateway } from 'src/websockets/websocket.gateway';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(FacGame)
    private readonly gameRepository: Repository<FacGame>,

    @InjectRepository(FacGameState)
    private readonly gameStateRepository: Repository<FacGameState>,

    @InjectRepository(FacBall)
    private readonly ballRepository: Repository<FacBall>,

    @InjectRepository(BingoCard)
    private readonly bingoCardRepository: Repository<BingoCard>,

    @InjectRepository(FacUsuarios)
    private readonly usuarioRepository: Repository<FacUsuarios>,

    @InjectRepository(DimRooms)
    private readonly roomRepository: Repository<DimRooms>,

    private websocketService: WebsocketGateway,
  ) {}

  // Crear un nuevo juego ✅
  async createGame(): Promise<FacGame> {
    const game = new FacGame();
    game.players = [];
    const savedGame = await this.gameRepository.save(game);

    const initialState = new FacGameState();
    initialState.status = 'esperando';
    initialState.game = savedGame;
    await this.gameStateRepository.save(initialState);

    this.scheduleGameDeletion(savedGame.id, 300000);

    this.websocketService.emitEvent('GameCreated', savedGame);

    return savedGame;
  }

  // Iniciar el juego ✅
  async startGame(gameId: number): Promise<FacGame> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['players', 'bingoCards', 'balls', 'states', 'rooms'],
    });

    if (!game)
      throw new HttpException('Juego no encontrado', HttpStatus.NOT_FOUND);

    const room = new DimRooms();
    room.game = game;
    const savedRoom = await this.roomRepository.save(room);

    game.rooms = [...(game.rooms || []), savedRoom];
    game.start_time = new Date();

    await this.gameRepository.save(game);

    const initialState = new FacGameState();
    initialState.status = 'en curso';
    initialState.game = game;

    await this.gameStateRepository.save(initialState);

    await this.assignBingoCardsToPlayers(game);
    await this.generateBalls(game);

    this.scheduleGameDeletion(game.id, 600000);

    const updatedGame = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['players', 'bingoCards', 'balls', 'states', 'rooms'],
    });

    this.websocketService.emitEvent('game-started', updatedGame);

    return updatedGame;
  }

  // Obtener las balotas de un juego ✅
  async getBingoBalls(gameId: number): Promise<number[]> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
    });

    if (!game)
      throw new HttpException('Juego no encontrado', HttpStatus.NOT_FOUND);

    return game.drawnBalls;
  }

  // Finalizar el juego ✅
  async endGame(gameId: number): Promise<string> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['balls', 'bingoCards', 'states', 'players'],
    });

    if (!game)
      throw new HttpException('Juego no encontrado', HttpStatus.NOT_FOUND);

    await this.removePlayersFromGame(game);

    await this.gameStateRepository.delete({ game: game });

    await this.ballRepository.delete({ game: game });

    await this.bingoCardRepository.delete({ game: game });

    await this.gameRepository.delete({ id: gameId });

    return 'El juego ha finalizado';
  }

  // Método para que el usuario se una a un juego ✅
  async joinGame(gameId: number, userId: number): Promise<FacGame> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['players'],
    });

    if (!game) {
      throw new HttpException('Juego no encontrado', HttpStatus.NOT_FOUND);
    }

    const user = await this.usuarioRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    user.game = game;

    await this.usuarioRepository.save(user);

    this.websocketService.emitEvent('game-joined', { gameId });

    return await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['players'],
    });
  }

  // Obtener los usuarios en una partida ✅
  async getUsersInGame(gameId: number): Promise<FacUsuarios[]> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['players'],
    });

    if (!game) {
      throw new HttpException('Juego no encontrado', HttpStatus.NOT_FOUND);
    }

    return game.players;
  }

  // Obtener todos los juegos ✅
  async getAllGames(): Promise<FacGame[]> {
    return await this.gameRepository.find({
      relations: ['players', 'bingoCards', 'balls', 'states', 'rooms'],
      order: { start_time: 'ASC' },
    });
  }

  // Obtener un juego por su id ✅
  async getGameById(gameId: number): Promise<FacGame> {
    return await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['players', 'bingoCards', 'balls', 'states'],
    });
  }

  // Funcion para que el juego se elimine en X segundos ✅
  private async scheduleGameDeletion(
    gameId: number,
    timeout: number,
  ): Promise<void> {
    setTimeout(async () => {
      const game = await this.gameRepository.findOne({ where: { id: gameId } });
      if (game) {
        await this.endGame(gameId);
      }
    }, timeout);
  }

  // Generar balotas del juego ✅
  private async generateBalls(game: FacGame): Promise<void> {
    const balls: FacBall[] = [];
    for (let i = 1; i <= 75; i++) {
      const ball = new FacBall();
      ball.number = i;
      ball.drawn = false;
      ball.game = game;
      balls.push(ball);
    }

    await this.ballRepository.save(balls);
  }

  // Funcion para asignar tarjetas de bingo a los jugadores ✅
  private async assignBingoCardsToPlayers(game: FacGame): Promise<void> {
    const players = game.players;

    if (!Array.isArray(players) || players.length === 0) {
      throw new HttpException(
        'No hay jugadores para asignar tarjetas de bingo',
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const player of players) {
      const bingoCard = new BingoCard();
      bingoCard.numbers = this.generateRandomBingoCard();
      bingoCard.usuario = player;
      bingoCard.game = game;

      await this.bingoCardRepository.save(bingoCard);

      player.cardId = bingoCard.id;

      await this.usuarioRepository.save(player);
    }
  }

  // Genera una tarjeta de Bingo aleatoria ✅
  private generateRandomBingoCard(): number[] {
    const numbers: number[] = [];
    const ranges = [
      { min: 1, max: 15 }, // Columna B: 1-15
      { min: 16, max: 30 }, // Columna I: 16-30
      { min: 31, max: 45 }, // Columna N: 31-45
      { min: 46, max: 60 }, // Columna G: 46-60
      { min: 61, max: 75 }, // Columna O: 61-75
    ];

    for (let i = 0; i < 5; i++) {
      const { min, max } = ranges[i];
      const columnNumbers = [];

      // Asegura que no haya números duplicados
      while (columnNumbers.length < 5) {
        const num = this.getRandomInt(min, max);
        if (!columnNumbers.includes(num)) {
          columnNumbers.push(num);
        }
      }
      numbers.push(...columnNumbers);
    }

    numbers[12] = 0;
    return numbers;
  }

  // Función para obtener un número aleatorio dentro de un rango ✅
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Obtener la tarjeta de bingo del usuario ✅
  async getBingoCard(
    userId: number,
    gameId: number,
  ): Promise<BingoCard | FacUsuarios> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['players'],
    });

    if (!game) {
      throw new HttpException('Juego no encontrado', HttpStatus.NOT_FOUND);
    }

    const player = game.players.find((player) => player.id === userId);

    if (!player) {
      throw new HttpException(
        'Usuario no encontrado en este juego',
        HttpStatus.NOT_FOUND,
      );
    }

    const userBingoCard = await this.usuarioRepository.findOne({
      where: { id: userId },
      relations: ['bingoCards'],
    });

    const bingoCard = userBingoCard.bingoCards.find(
      (card) => card.id === player.cardId,
    );

    if (!bingoCard) {
      throw new HttpException(
        'Tarjeta de bingo no encontrada para este usuario',
        HttpStatus.NOT_FOUND,
      );
    }

    return bingoCard;
  }

  // Extraer balotas del juego ✅
  async drawBall(gameId: number): Promise<FacBall> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['balls'],
    });

    if (!game)
      throw new HttpException('Juego no encontrado', HttpStatus.NOT_FOUND);

    const drawnBall = game.balls.find((ball) => !ball.drawn);
    if (!drawnBall)
      throw new HttpException(
        'No hay más balotas para sacar',
        HttpStatus.NO_CONTENT,
      );

    drawnBall.drawn = true;
    await this.ballRepository.save(drawnBall);

    if (!Array.isArray(game.drawnBalls)) {
      game.drawnBalls = []; // Inicializa si no es un array
    }

    // Actualizar las balotas que se han sacado
    game.drawnBalls = [...game.drawnBalls, drawnBall.number];
    await this.gameRepository.save(game);

    this.websocketService.emitEvent('ball-drawn', drawnBall);

    return drawnBall;
  }

  // Comprobar si un jugador ha ganado ❔
  async checkBingo(gameId: number, userId: number): Promise<boolean> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['bingoCards', 'bingoCards.usuario', 'players'],
    });
    if (!game)
      throw new HttpException('Juego no encontrado', HttpStatus.NOT_FOUND);

    const userBingoCard = game.bingoCards.find(
      (card) => card.usuario?.id === userId,
    );

    if (!userBingoCard)
      throw new HttpException(
        'Tarjetón de bingo no encontrado',
        HttpStatus.NOT_FOUND,
      );

    const hasBingo = this.validateBingo(userBingoCard, game.drawnBalls);

    if (hasBingo) {
      await this.removeAllUsersFromGame(game);

      this.websocketService.emitEvent('game-winner', { userId });
    } else {
      await this.removeUserFromGame(game, userBingoCard);

      this.websocketService.emitEvent('not-bingo', {
        url: 'http://localhost:5173/home/game',
      });
    }

    return hasBingo;
  }

  // Eliminar al usuario de la partida
  private async removeUserFromGame(
    game: FacGame,
    bingoCard: BingoCard,
  ): Promise<void> {
    await this.bingoCardRepository.delete({ id: bingoCard.id });

    const userIndex = game.players.findIndex(
      (player) => player.id === bingoCard.usuario.id,
    );
    if (userIndex !== -1) {
      game.players.splice(userIndex, 1);

      await this.gameRepository.save(game);
    }
  }

  private async removeAllUsersFromGame(game: FacGame): Promise<void> {
    await this.bingoCardRepository.delete({ game: { id: game.id } });

    game.players = [];
    await this.gameRepository.save(game);
  }

  private validateBingo(bingoCard: BingoCard, drawnBalls: number[]): boolean {
    if (!bingoCard || !bingoCard.numbers) {
      throw new HttpException(
        'Los números de la tarjeta son inválidos',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!drawnBalls || drawnBalls.length === 0) {
      throw new HttpException(
        'Las bolas sorteadas son inválidas',
        HttpStatus.BAD_REQUEST,
      );
    }

    const cardNumbers = bingoCard.numbers.filter(
      (num) => num !== null && num !== undefined,
    );

    console.log('cardNumbers', cardNumbers);

    const matrix = [];
    for (let i = 0; i < 5; i++) {
      matrix.push(cardNumbers.slice(i * 5, i * 5 + 5));
    }

    // Comprobar filas
    for (const row of matrix) {
      if (row.every((num) => drawnBalls.includes(num))) {
        return true; // Bingo en fila
      }
    }

    // Comprobar columnas
    for (let col = 0; col < 5; col++) {
      if (matrix.every((row) => drawnBalls.includes(row[col]))) {
        return true; // Bingo en columna
      }
    }

    // Comprobar diagonales
    const diagonal1 = [0, 1, 2, 3, 4].every((i) =>
      drawnBalls.includes(matrix[i][i]),
    );
    const diagonal2 = [0, 1, 2, 3, 4].every((i) =>
      drawnBalls.includes(matrix[i][4 - i]),
    );

    if (diagonal1 || diagonal2) {
      return true; // Bingo en diagonal
    }

    // Comprobar esquinas
    const corners = [matrix[0][0], matrix[0][4], matrix[4][0], matrix[4][4]];
    if (corners.every((corner) => drawnBalls.includes(corner))) {
      return true; // Bingo en esquinas
    }

    // Comprobar si toda la tarjeta está llena
    if (cardNumbers.every((num) => drawnBalls.includes(num))) {
      return true; // Bingo completo
    }

    // Ninguna condición de bingo se cumple
    return false;
  }

  // Si se necesita eliminar a los jugadores asociados del juego ✅
  private async removePlayersFromGame(game: FacGame): Promise<void> {
    if (game.players && game.players.length > 0) return;

    for (const player of game.players) {
      player.game = null;
      await this.usuarioRepository.save(player);
    }
  }
}
