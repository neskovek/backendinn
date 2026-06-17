import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../models/project.entity';

@Injectable()
export class ProjectRepository {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
  ) {}

  async findAll(
    filters?: { status?: ProjectStatus; userId?: string },
    page = 1,
    limit = 100,
  ): Promise<{
    result: Project[];
    pagination: { page: number; itensCount: number; limit: number };
  }> {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.user = { id: filters.userId };

    const [result, itensCount] = await this.repo.findAndCount({
      where,
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      result,
      pagination: {
        page,
        itensCount,
        limit,
      },
    };
  }

  findById(id: string): Promise<Project | null> {
    return this.repo.findOne({ where: { id }, relations: ['user'] });
  }

  save(project: Partial<Project>): Promise<Project> {
    return this.repo.save(project);
  }

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
