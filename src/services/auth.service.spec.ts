import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
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

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<Pick<UserService, 'findByEmail'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(async () => {
    userService = { findByEmail: jest.fn() };
    jwtService = { sign: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('Deve retornar o token de acesso e o usuário', async () => {
      userService.findByEmail.mockResolvedValue(mockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login('hero@test.com', 'plain');

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-1', role: UserRole.HERO }),
      );
    });

    it('Deve lançar UnauthorizedException quando o usuário não for encontrado', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.login('ghost@test.com', 'any')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Deve lançar UnauthorizedException quando a senha estiver incorreta', async () => {
      userService.findByEmail.mockResolvedValue(mockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('hero@test.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
