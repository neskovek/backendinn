import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { User, UserRole } from '../models/user.entity';

jest.mock('bcrypt');

const mockUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-1',
    name: 'Hero One',
    email: 'hero@test.com',
    password: 'hashed',
    role: UserRole.HERO,
    ...overrides,
  }) as User;

const mockRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: UserRepository, useValue: mockRepo }],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('Deve retornar usuários paginados', async () => {
      const expected = {
        result: [mockUser()],
        pagination: { page: 1, itensCount: 1, limit: 10 },
      };
      mockRepo.findAll.mockResolvedValue(expected);

      const result = await service.findAll(1, 10);

      expect(mockRepo.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(expected);
    });
  });

  describe('findById', () => {
    it('Deve retornar o usuário quando encontrado', async () => {
      mockRepo.findById.mockResolvedValue(mockUser());

      const result = await service.findById('user-1');

      expect(result.id).toBe('user-1');
    });

    it('Deve lançar NotFoundException quando o usuário não existir', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById('ghost')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('Deve hashear a senha e salvar o novo usuário', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockRepo.save.mockResolvedValue(mockUser({ id: 'new-user' }));

      const result = await service.create({
        name: 'Hero One',
        email: 'hero@test.com',
        password: 'plain',
        role: UserRole.HERO,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
      expect(result).toEqual({ id: 'new-user' });
    });

    it('Deve retornar ConflictException quando o email já está em uso', async () => {
      mockRepo.findByEmail.mockResolvedValue(mockUser());

      await expect(
        service.create({
          name: 'Dup',
          email: 'hero@test.com',
          password: 'plain',
          role: UserRole.HERO,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('Deve atualizar o usuário e retornar o ID', async () => {
      mockRepo.findById.mockResolvedValue(mockUser());
      mockRepo.update.mockResolvedValue(mockUser({ name: 'Updated' }));

      const result = await service.update('user-1', { name: 'Updated' });

      expect(result).toEqual({ id: 'user-1' });
    });

    it('Deve lançar NotFoundException quando o usuário a ser atualizado não existir', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.update('ghost', { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('Deve deletar o usuário quando encontrado', async () => {
      mockRepo.findById.mockResolvedValue(mockUser());
      mockRepo.delete.mockResolvedValue(undefined);

      await service.delete('user-1');

      expect(mockRepo.delete).toHaveBeenCalledWith('user-1');
    });

    it('Deve lançar NotFoundException quando o usuário a ser deletado não existir', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.delete('ghost')).rejects.toThrow(NotFoundException);
    });
  });
});
