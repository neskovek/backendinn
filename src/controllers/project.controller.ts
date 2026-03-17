import { Controller, Get, Post, Delete, Param, Body, Query, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProjectStatus } from '../models/project.entity';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto } from '../dtos/project/create-project.dto';
import { UpdateProjectDto } from '../dtos/project/update-project.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { SessionUser } from 'src/decorators/sessionUser.decorator';

@ApiTags('projects')
@Controller('project')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectsService: ProjectService) {}

  @Get()
  findAll(
    @SessionUser() user: any,
    @Query('status') status?: ProjectStatus,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const effectiveUserId = user.role === 'admin' ? userId : user.sub;
    return this.projectsService.findAll({ status, userId: effectiveUserId }, Number(page) || 1, Number(limit) || 100);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @SessionUser() user: any) {
    return this.projectsService.findById(id, user);
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @SessionUser() user: any) {
    return this.projectsService.save(dto, user.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateProjectDto, @SessionUser() user: any) {
    return this.projectsService.update(id, data, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @SessionUser() user: any) {
    return this.projectsService.delete(id, user);
  }
}
