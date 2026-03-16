import { ProjectStatus } from '../models/project.entity';

export class Goals {
  description?: string;
  isCompleted?: boolean;
}

export class Project {
  id?: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  goals?: Goals[];
  userId?: string;
}
