import { ConflictException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { User, UserRole } from '../models/user.entity';

//CONSTANTES 
const HASH_SALT_ROUNDS = 10;

//DTOs e INTERFACES
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
    try {
      return await this.usersRepository.findAll(page, limit);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao tentar listar os usuários');
    }
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findByEmail(email);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar usuário por email');
    }
  }

  async create(data: CreateUserDto): Promise<{ id: string }> {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(data.password, HASH_SALT_ROUNDS);
    
    try {
      const user = await this.usersRepository.save({
        name: data.name,
        email: data.email,
        passwordHash,
        character: data.character,
        role: data.role ?? UserRole.HERO,
      });

      if (!user) {
        throw new InternalServerErrorException('Falha ao criar o usuário no banco de dados');
      }

      return { id: user.id };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException('Erro interno ao tentar criar o usuário');
    }
  }

  async save(data: Partial<User>): Promise<User> {
    try {
      const user = await this.usersRepository.save(data);
      if (!user) {
        throw new InternalServerErrorException('Falha ao salvar as informações do usuário');
      }
      return user;
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException('Erro interno ao salvar os dados');
    }
  }

  async update(id: string, data: Partial<User>): Promise<{ id: string }> {
    try {
      const updatedUser = await this.usersRepository.update(id, data);
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
      return { id: updatedUser.id };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro interno ao tentar atualizar o usuário');
    }
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); 
    
    try {
      return await this.usersRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Erro interno ao tentar remover o usuário');
    }
  }
}