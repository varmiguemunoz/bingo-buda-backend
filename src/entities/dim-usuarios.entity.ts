import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('dim_usuarios')
@Unique('dim_usuarios_email_key', ['email'])
export class DimUsuarios {
  @Exclude()
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'dim_usuarios_pkey' })
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 32 })
  username: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: false, default: false })
  verificado: boolean;

  @Exclude()
  @CreateDateColumn()
  created_at: Date;

  @Exclude()
  @UpdateDateColumn()
  updated_at: Date;

  constructor(partial: Partial<DimUsuarios>) {
    Object.assign(this, partial);
  }
}
