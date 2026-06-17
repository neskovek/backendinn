import { Controller, Get, Post, Delete, Param, Body, Put, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { SessionUser } from 'src/decorators/sessionUser.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly usersService: UserService) {}

  
  private ensureUserHasPermission(currentUser: any, targetId: string, action: 'atualizar' | 'remover') {
    const isAdmin = currentUser.role === 'admin';
    const isOwner = currentUser.sub === targetId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        `Permissão negada: você não tem autorização para ${action} os dados de outro usuário.`
      );
    }
  }

  
  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Criar usuário (apenas admin)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Apenas administradores podem criar usuários.' })
  @ApiResponse({ status: 409, description: 'Email já em uso.' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

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
    
    this.ensureUserHasPermission(user, id, 'atualizar');

    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover herói (admin ou o próprio usuário)' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para remover este usuário.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  remove(@Param('id') id: string, @SessionUser() user: any) {
    
    this.ensureUserHasPermission(user, id, 'remover');

    return this.usersService.delete(id);
  }
}