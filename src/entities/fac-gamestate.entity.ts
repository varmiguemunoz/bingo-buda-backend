import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FacGame } from './fac-game.entity'; // Importa la entidad Game

@Entity()
export class FacGameState {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'game_state_pkey' })
  id: number;

  @Column({
    type: 'enum',
    enum: ['esperando', 'en curso', 'finalizado'],
    default: 'esperando',
  })
  status: string;

  @Column({ type: 'int', default: 0 })
  ballsDrawn: number;

  @ManyToOne(() => FacGame, (game) => game.states, { onDelete: 'CASCADE' })
  game: FacGame;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
