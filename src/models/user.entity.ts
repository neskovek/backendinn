import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Project } from './project.entity';

export enum UserRole {
  ADMIN = 'admin',
  HERO = 'hero',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  @Unique(['email'])
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Column({ nullable: true })
  character?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.HERO })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Project, (project) => project.user)
  projects!: Project[];
}
