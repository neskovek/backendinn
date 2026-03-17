import { Controller, Get, Post, Delete, Param, Body, Query, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProjectStatus } from '../models/project.entity';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto } from '../dtos/project/create-project.dto';
import { UpdateProjectDto } from '../dtos/project/update-project.dto';

@ApiTags('projects')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectsService: ProjectService) {}

  @Get()
  findAll(
    @Query('status') status?: ProjectStatus,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.findAll({ status, userId }, Number(page) || 1, Number(limit) || 20);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.save(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.projectsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }
}
