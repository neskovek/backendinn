import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../repositories/project.repository';
import { Project, ProjectStatus } from '../models/project.entity';
import { UserRole } from '../models/user.entity';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  findAll(
    filters?: { status?: ProjectStatus; userId?: string },
    page?: number,
    limit?: number,
  ): Promise<{ result: Project[]; pagination: { page: number; itensCount: number; limit: number } }> {
    return this.projectRepository.findAll(filters, page, limit);
  }

  async findById(id: string, sessionUser?: { sub: string; role: UserRole }): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new NotFoundException('Project not found');

    const isNotAdmin = sessionUser?.role !== UserRole.ADMIN;
    const isNotOwner = project.user?.id !== sessionUser?.sub;

    if (
      sessionUser
      && isNotAdmin
      && isNotOwner
    ) {
      throw new ForbiddenException('Access denied');
    }

    return project;
  }

  async save(data: Partial<Project>, userId?: string): Promise<{ id: string }> {
    const project: Partial<Project> = { ...data };
    if (userId) project.user = { id: userId } as any;
    const savedProject = await this.projectRepository.save(project);

    return {
      id: savedProject.id
    }
  }

  async update(id: string, data: Partial<Project>, sessionUser?: { sub: string; role: UserRole }): Promise<{ id: string }> {
    await this.findById(id, sessionUser);
    const updatedProject = await this.projectRepository.update(id, data);
    if (!updatedProject) throw new NotFoundException('Project not found');

    return {
      id: updatedProject.id
    }
  }

  async delete(id: string, sessionUser?: { sub: string; role: UserRole }): Promise<void> {
    await this.findById(id, sessionUser);
    return this.projectRepository.delete(id);
  }
}
