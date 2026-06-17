import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Project, ProjectStatus } from '../models/project.entity';
import { SessionUser } from '../interfaces/session';
import { User, UserRole } from '../models/user.entity';
import { ProjectService } from './project.service';
import { ProjectRepository } from '../repositories/project.repository';

type CreateProjectDto = Parameters<ProjectService['save']>[0];
type UpdateProjectDto = Parameters<ProjectService['update']>[1];

const mockProject = (overrides: Partial<Project> = {}): Project =>
  ({
    id: 'project-1',
    name: 'Test Project',
    status: ProjectStatus.PENDING,
    user: { id: 'user-1' } as User, // Tipado adequadamente como User
    ...overrides,
  }) as Project;

const adminUser: SessionUser = { sub: 'admin-1', role: UserRole.ADMIN };
const heroUser: SessionUser = { sub: 'user-1', role: UserRole.HERO };
const otherUser: SessionUser = { sub: 'other-99', role: UserRole.HERO };

const mockRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: ProjectRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('Deve delegar para o repositório com os filtros fornecidos', async () => {
      const expected = {
        result: [],
        pagination: { page: 1, itensCount: 0, limit: 10 },
      };
      mockRepo.findAll.mockResolvedValue(expected);

      const result = await service.findAll(
        { status: ProjectStatus.IN_PROGRESS },
        1,
        10,
      );

      expect(mockRepo.findAll).toHaveBeenCalledWith(
        { status: ProjectStatus.IN_PROGRESS },
        1,
        10,
      );
      expect(result).toBe(expected);
    });
  });

  describe('findById', () => {
    it('Deve retornar o projeto quando o admin solicitar qualquer projeto', async () => {
      mockRepo.findById.mockResolvedValue(mockProject());

      const result = await service.findById('project-1', adminUser);

      expect(result.id).toBe('project-1');
    });

    it('Deve retornar o projeto quando o proprietário solicitar seu próprio projeto', async () => {
      mockRepo.findById.mockResolvedValue(
        mockProject({ user: { id: 'user-1' } as User }),
      );

      const result = await service.findById('project-1', heroUser);

      expect(result.id).toBe('project-1');
    });

    it('Deve lançar ForbiddenException quando o herói não for o proprietário e tentar acessar o projeto', async () => {
      mockRepo.findById.mockResolvedValue(
        mockProject({ user: { id: 'user-1' } as User }),
      );

      await expect(service.findById('project-1', otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('Deve lançar NotFoundException quando o projeto não existir', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent', adminUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('save', () => {
    it('Deve salvar e retornar o ID do projeto', async () => {
      const saved = mockProject({ id: 'new-project' });
      mockRepo.save.mockResolvedValue(saved);

      const result = await service.save({
        name: 'New',
        userId: 'user-1',
      } as CreateProjectDto);

      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 'new-project' });
    });

    it('Deve salvar sem usuário quando userId não for fornecido', async () => {
      const saved = mockProject({ id: 'no-user-project' });
      mockRepo.save.mockResolvedValue(saved);

      await service.save({ name: 'No User' } as CreateProjectDto);

      const callArg = mockRepo.save.mock.calls[0] as Partial<Project>;
      expect(callArg.user).toBeUndefined();
    });
  });

  describe('update', () => {
    it('Deve atualizar e retornar o ID do projeto', async () => {
      const existing = mockProject();
      const updated = mockProject({ name: 'Updated' });
      mockRepo.findById.mockResolvedValue(existing);
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.update(
        'project-1',
        { name: 'Updated' } as UpdateProjectDto,
        adminUser,
      );

      expect(result).toEqual({ id: 'project-1' });
    });

    it('Deve lançar NotFoundException quando o projeto atualizado não for encontrado', async () => {
      mockRepo.findById.mockResolvedValue(mockProject());
      mockRepo.update.mockResolvedValue(null);

      await expect(
        service.update('project-1', {} as UpdateProjectDto, adminUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('Deve deletar o projeto quando o solicitante for admin', async () => {
      mockRepo.findById.mockResolvedValue(mockProject());
      mockRepo.delete.mockResolvedValue(undefined);

      await service.delete('project-1', adminUser);

      expect(mockRepo.delete).toHaveBeenCalledWith('project-1');
    });

    it('Deve lançar ForbiddenException quando o não proprietário tentar deletar', async () => {
      mockRepo.findById.mockResolvedValue(
        mockProject({ user: { id: 'user-1' } as User }),
      );

      await expect(service.delete('project-1', otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
