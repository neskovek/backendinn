import { Controller, Get, Delete, Param, Body, Put, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { SessionUser } from 'src/decorators/sessionUser.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os heróis' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.findAll(Number(page) || 1, Number(limit) || 100);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar herói por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar herói (admin ou o próprio usuário)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar este usuário.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  update(@Param('id') id: string, @Body() data: UpdateUserDto, @SessionUser() user: any) {
    if (
      user.role !== 'admin'
      && user.sub !== id
    ) throw new ForbiddenException('Access denied');

    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover herói (admin ou o próprio usuário)' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para remover este usuário.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  remove(@Param('id') id: string, @SessionUser() user: any) {
    if (
      user.role !== 'admin'
      && user.sub !== id
    ) throw new ForbiddenException('Access denied');

    return this.usersService.delete(id);
  }
}
