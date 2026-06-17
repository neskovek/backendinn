import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectStatus } from '../models/project.entity';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto } from '../dtos/project/create-project.dto';
import { UpdateProjectDto } from '../dtos/project/update-project.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { SessionUser } from 'src/decorators/sessionUser.decorator';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('project')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectsService: ProjectService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar projetos (admin vê todos; herói vê apenas os seus)',
  })
  @ApiQuery({ name: 'status', required: false, enum: ProjectStatus })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filtrar por herói (apenas admin)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de projetos retornada com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  findAll(
    @SessionUser() user: any,
    @Query('status') status?: ProjectStatus,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const effectiveUserId = user.role === 'admin' ? userId : user.sub;
    return this.projectsService.findAll(
      { status, userId: effectiveUserId },
      Number(page) || 1,
      Number(limit) || 100,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar projeto por ID' })
  @ApiResponse({ status: 200, description: 'Projeto encontrado.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para visualizar este projeto.',
  })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  findOne(@Param('id') id: string, @SessionUser() user: any) {
    return this.projectsService.findById(id, user);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Criar projeto (apenas admin)' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas administradores podem criar projetos.',
  })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.save(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Atualizar projeto (apenas admin)' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas administradores podem editar projetos.',
  })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  update(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.projectsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Remover projeto (apenas admin)' })
  @ApiResponse({ status: 200, description: 'Projeto removido com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas administradores podem remover projetos.',
  })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  remove(@Param('id') id: string, @SessionUser() user: any) {
    return this.projectsService.delete(id, user);
  }
}
