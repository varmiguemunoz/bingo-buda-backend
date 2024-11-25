import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FacGame } from './fac-game.entity';
import { Exclude } from 'class-transformer';

@Entity('dim_rooms')
export class DimRooms {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'dim_rooms_pkey' })
  id: number;

  @Column({ type: 'int', nullable: false, default: 8 })
  capacity: number;

  @ManyToOne(() => FacGame, (game) => game.rooms, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  game: FacGame;
}
