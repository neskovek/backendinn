import { Controller, Get, Post, Delete, Param, Body, Query, Put } from '@nestjs/common';
import { ProjectStatus } from '../models/project.entity';
import { Project } from '../interfaces/project';
import { ProjectService } from '../services/project.service';

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
  create(@Body() dto: Project) {
    return this.projectsService.save(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Project) {
    return this.projectsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }
}
