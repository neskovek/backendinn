import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { UserRole } from '../models/user.entity';
import { ErrorMessages } from '../constants/error-messages.constant';

const HASH_SALT_ROUNDS = 10;
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  character?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const existingUser = await this.userService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException(ErrorMessages.EMAIL_ALREADY_IN_USE);
    }

    const hashed = await bcrypt.hash(data.password, HASH_SALT_ROUNDS);
    const user = await this.userService.save({
      ...data,
      passwordHash: hashed,
      role: UserRole.HERO,
    });

    if (!user) {
      throw new InternalServerErrorException(
        ErrorMessages.FAILED_TO_CREATE_USER,
      );
    }

    return {
      message: 'Account created successfully',
    };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        character: user.character,
      },
    };
  }
}
