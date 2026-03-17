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

  async findAll(page = 1, limit = 100): Promise<{ result: User[]; pagination: { page: number; itensCount: number; limit: number } }> {
    const [result, itensCount] = await this.repo.findAndCount({
      relations: ['projects'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      result,
      pagination: {
        page,
        itensCount,
        limit,
      },
    };
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id }, relations: ['projects'] });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
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
