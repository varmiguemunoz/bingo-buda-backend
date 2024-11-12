import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FacGame } from './fac-game.entity';
import { FacUsuarios } from './fac-usuarios.entity';

@Entity()
export class BingoCard {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'bingo_card_pkey' })
  id: number;

  @ManyToOne(() => FacGame, (game) => game.bingoCards)
  game: FacGame;

  @ManyToOne(() => FacUsuarios, (usuario) => usuario.bingoCards)
  usuario: FacUsuarios;

  @Column('simple-array')
  numbers: number[];

  @Column({ default: false })
  isCompleted: boolean;
}
