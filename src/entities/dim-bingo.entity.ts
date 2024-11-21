import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FacGame } from './fac-game.entity';
import { FacUsuarios } from './fac-usuarios.entity';

@Entity()
export class BingoCard {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'bingo_card_pkey' })
  id: number;

  @ManyToOne(() => FacGame, (game) => game.bingoCards, { onDelete: 'CASCADE' })
  game: FacGame;

  @ManyToOne(() => FacUsuarios, (usuario) => usuario.bingoCards, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  usuario: FacUsuarios;

  @Column('simple-array')
  numbers: number[];

  @Column({ default: false })
  isCompleted: boolean;
}
