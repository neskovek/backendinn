import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly usersRepository: UserRepository) {}

  findAll(page?: number, limit?: number): Promise<User[]> {
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

  save(data: Partial<User>): Promise<User> {
    return this.usersRepository.save(data);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.usersRepository.update(id, data);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.usersRepository.delete(id);
  }
}
