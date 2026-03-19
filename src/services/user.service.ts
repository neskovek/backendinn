import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { User, UserRole } from '../models/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly usersRepository: UserRepository) {}

  findAll(page?: number, limit?: number): Promise<{ result: User[]; pagination: { page: number; itensCount: number; limit: number } }> {
    return this.usersRepository.findAll(page, limit);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async create(data: { name: string; email: string; password: string; character?: string; role?: UserRole }): Promise<{ id: string }> {
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.usersRepository.save({
      name: data.name,
      email: data.email,
      passwordHash,
      character: data.character,
      role: data.role ?? UserRole.HERO,
    });

    return { id: user.id };
  }

  save(data: Partial<User>): Promise<User> {
    return this.usersRepository.save(data);
  }

  async update(id: string, data: Partial<User>): Promise<{ id: string }> {
    const updatedUser = await this.usersRepository.update(id, data);
    if (!updatedUser) throw new NotFoundException('User not found');

    return {
      id: updatedUser.id
    }
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.usersRepository.delete(id);
  }
}
