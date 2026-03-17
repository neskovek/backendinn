import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../models/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'João Silva' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Warrior' })
  @IsOptional()
  @IsString()
  character?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.HERO })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
