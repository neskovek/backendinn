import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { User, UserRole } from '../models/user.entity';
import { ErrorMessages } from '../constants/error-messages.constant';

const HASH_SALT_ROUNDS = 10;
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  character?: string;
  role?: UserRole;
}

export interface PaginatedResult<T> {
  result: T[];
  pagination: {
    page: number;
    itensCount: number;
    limit: number;
  };
}

@Injectable()
export class UserService {
  constructor(private readonly usersRepository: UserRepository) {}

  async findAll(page?: number, limit?: number): Promise<PaginatedResult<User>> {
    return await this.usersRepository.findAll(page, limit);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findByEmail(email);
  }

  async create(data: CreateUserDto): Promise<{ id: string }> {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException(ErrorMessages.EMAIL_ALREADY_IN_USE);
    }

    const passwordHash = await bcrypt.hash(data.password, HASH_SALT_ROUNDS);

    const user = await this.usersRepository.save({
      name: data.name,
      email: data.email,
      passwordHash,
      character: data.character,
      role: data.role ?? UserRole.HERO,
    });

    if (!user) {
      throw new InternalServerErrorException(
        ErrorMessages.FAILED_TO_CREATE_USER,
      );
    }

    return { id: user.id };
  }

  async save(data: Partial<User>): Promise<User> {
    try {
      const user = await this.usersRepository.save(data);
      if (!user) {
        throw new InternalServerErrorException(
          ErrorMessages.FAILED_TO_CREATE_USER,
        );
      }
      return user;
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException(
        ErrorMessages.FAILED_TO_CREATE_USER,
      );
    }
  }

  async update(id: string, data: Partial<User>): Promise<{ id: string }> {
    try {
      const user = await this.usersRepository.findById(id);
      if (!user) {
        throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
      }

      const updatedUser = await this.usersRepository.update(id, data);
      if (!updatedUser) {
        throw new NotFoundException(ErrorMessages.FAILED_TO_UPDATE_USER);
      }

      return { id: updatedUser.id };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        ErrorMessages.FAILED_TO_UPDATE_USER,
      );
    }
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return await this.usersRepository.delete(id);
  }
}
