import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../models/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'Warrior' })
  @IsOptional()
  @IsString()
  character?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.HERO })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
