import type { User } from './api';

export enum ProjectStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  DELAYED = 3
}

export interface ProjectDetail {
  id: string;
  name: string;
  password?: string;
  deliverables: string;
  status: ProjectStatus;
  start_time?: Date;
  end_time?: Date;
  days_needed: number;
  results?: Array<{ id?: number; description: string }>;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectListItem {
  id: string;
  name: string;
  status: ProjectStatus;
}

export interface ProjectListResponse {
  items: ProjectListItem[];
  total: number;
}

export interface ProjectUser {
  id: number;
  project_id: string;
  user_id: number;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    nickname: string;
  };
}

export interface Project {
  id: string;
  name: string;
  status: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  project_users?: ProjectUser[];
}

export function getProjectStatusName(status: ProjectStatus): string {
  switch (status) {
    case ProjectStatus.NOT_STARTED:
      return '未开始';
    case ProjectStatus.IN_PROGRESS:
      return '进行中';
    case ProjectStatus.COMPLETED:
      return '已完成';
    case ProjectStatus.DELAYED:
      return '已延期';
    default:
      return '未知状态';
  }
}

export function getProjectStatusType(status: ProjectStatus): string {
  switch (status) {
    case ProjectStatus.NOT_STARTED:
      return 'info';
    case ProjectStatus.IN_PROGRESS:
      return 'primary';
    case ProjectStatus.COMPLETED:
      return 'success';
    case ProjectStatus.DELAYED:
      return 'danger';
    default:
      return 'info';
  }
} 