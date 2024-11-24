import {
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  Column,
  OneToMany,
  Unique,
} from 'typeorm';

import { DimUsuarios } from './dim-usuarios.entity';
import { Exclude } from 'class-transformer';
import { FacGame } from './fac-game.entity';
import { BingoCard } from './dim-bingo.entity';

@Entity()
@Unique(['usuario'])
export class FacUsuarios {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'fac_usuarios_pkey1' })
  id: number;

  @OneToOne(() => DimUsuarios, { nullable: false, cascade: true })
  @JoinColumn({
    name: 'id_usuario',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fac_usuarios_id_usuario_fkey',
  })
  usuario: DimUsuarios;

  @ManyToOne(() => FacGame, (game) => game.players, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'game_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fac_usuarios_game_id_fkey',
  })
  game: FacGame;

  @Column({ nullable: true })
  cardId: number;

  @OneToMany(() => BingoCard, (card) => card.usuario, { cascade: false })
  bingoCards: BingoCard[];

  @Column({
    type: 'enum',
    enum: ['esperando', 'jugando', 'ganador', 'descalificado'],
    default: 'esperando',
  })
  status: string;

  @Column({ nullable: true })
  socketId: string;

  @Exclude()
  @CreateDateColumn()
  created_at: Date;

  @Exclude()
  @UpdateDateColumn()
  updated_at: Date;
  player: BingoCard;
}
