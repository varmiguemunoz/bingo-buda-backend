import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FacUsuarios } from './fac-usuarios.entity';
import { BingoCard } from './dim-bingo.entity';
import { FacGameState } from './fac-gamestate.entity';
import { FacBall } from './fac-ball.entity';
import { DimRooms } from './dim-rooms.entity';

@Entity()
export class FacGame {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'game_pkey' })
  id: number;

  @Column('simple-array', { nullable: true })
  drawnBalls: number[];

  @Column({ type: 'int', default: 75 })
  totalBalls: number;

  @Column({ type: 'int', default: 5 })
  ballDelay: number;

  @OneToMany(() => DimRooms, (room) => room.game, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  rooms: DimRooms[];

  @OneToMany(() => FacUsuarios, (usuario) => usuario.game, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  players: FacUsuarios[];

  @OneToMany(() => BingoCard, (card) => card.game)
  bingoCards: BingoCard[];

  @OneToMany(() => FacBall, (ball) => ball.game)
  balls: FacBall[];

  @OneToMany(() => FacGameState, (gameState) => gameState.game)
  states: FacGameState[];

  @CreateDateColumn()
  start_time: Date;

  @UpdateDateColumn()
  end_time: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
