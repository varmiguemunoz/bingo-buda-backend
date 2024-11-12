import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FacGame } from './fac-game.entity';

@Entity()
export class FacBall {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'ball_pkey' })
  id: number;

  @Column({ type: 'int' })
  number: number;

  @Column({ type: 'boolean', default: false })
  drawn: boolean;

  @ManyToOne(() => FacGame, (game) => game.balls)
  game: FacGame;
}
