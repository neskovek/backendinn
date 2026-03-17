import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { UserRole } from '../models/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: { name: string; email: string; password: string; character?: string }) {
    const existing = await this.userService.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.userService.save({
      ...data,
      passwordHash: hashed,
      role: UserRole.HERO,
    });

    if (!user) throw new InternalServerErrorException('Failed to create user');

    return {
      message: "Account created successfully",
    };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        character: user.character
      },
    };
  }
}
