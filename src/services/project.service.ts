import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectRepository } from '../repositories/project.repository';
import { Project, ProjectStatus } from '../models/project.entity';
import { UserRole } from '../models/user.entity';
import { ErrorMessages } from '../constants/error-messages.constant';
import { CreateProjectDto } from '../dtos/project/create-project.dto';
import { UpdateProjectDto } from '../dtos/project/update-project.dto';
import { SessionUser } from '../interfaces/session';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  findAll(
    filters?: { status?: ProjectStatus; userId?: string },
    page?: number,
    limit?: number,
  ): Promise<{
    result: Project[];
    pagination: { page: number; itensCount: number; limit: number };
  }> {
    return this.projectRepository.findAll(filters, page, limit);
  }

  async findById(id: string, sessionUser?: SessionUser): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND);

    const isNotAdmin = sessionUser?.role !== UserRole.ADMIN;
    const isNotOwner = project.user?.id !== sessionUser?.sub;
    if (sessionUser && isNotAdmin && isNotOwner) {
      throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);
    }

    return project;
  }

  async save(data: CreateProjectDto): Promise<{ id: string }> {
    const { userId, ...rest } = data;
    const project: Partial<Project> = { ...rest };
    if (userId) project.user = { id: userId } as Project['user'];
    const savedProject = await this.projectRepository.save(project);
    return { id: savedProject.id };
  }

  async update(
    id: string,
    data: UpdateProjectDto,
    sessionUser?: SessionUser,
  ): Promise<{ id: string }> {
    await this.findById(id, sessionUser);

    const { userId, ...rest } = data;
    const payload: Partial<Project> = { ...rest };
    if (userId !== undefined) payload.user = { id: userId } as Project['user'];

    const updatedProject = await this.projectRepository.update(id, payload);
    if (!updatedProject)
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND);

    return { id: updatedProject.id };
  }

  async delete(id: string, sessionUser?: SessionUser): Promise<void> {
    await this.findById(id, sessionUser);
    return this.projectRepository.delete(id);
  }
}
