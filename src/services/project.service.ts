import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../repositories/project.repository';
import { Project, ProjectStatus } from '../models/project.entity';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  findAll(
    filters?: { status?: ProjectStatus; userId?: string },
    page?: number,
    limit?: number,
  ): Promise<Project[]> {
    return this.projectRepository.findAll(filters, page, limit);
  }

  async findById(id: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  save(data: Partial<Project>): Promise<Project> {
    return this.projectRepository.save(data);
  }

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const project = await this.projectRepository.update(id, data);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.projectRepository.delete(id);
  }
}
