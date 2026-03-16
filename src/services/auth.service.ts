import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
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

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, character: user.character },
    };
  }
}
