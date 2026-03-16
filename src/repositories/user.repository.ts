import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findAll(page = 1, limit = 100): Promise<User[]> {
    return this.repo.find({
      relations: ['projects'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id }, relations: ['projects'] });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  save(user: Partial<User>): Promise<User> {
    return this.repo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
