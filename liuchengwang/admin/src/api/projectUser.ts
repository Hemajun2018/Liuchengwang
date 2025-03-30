import request from '@/utils/request';
import type { User } from '../types/api';

interface ProjectUserItem {
  id: number;
  project_id: string;
  user_id: number;
  can_edit: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

/**
 * 获取项目用户列表
 */
export const getProjectUsers = (userId: string | number): Promise<ProjectUserItem[]> => {
  return request.get(`/project-users?userId=${userId}`).then(res => res.data);
};

/**
 * 添加项目用户
 */
export const addProjectUser = (params: {
  projectId: string;
  userId: number;
  can_edit: boolean;
}): Promise<ProjectUserItem> => {
  return request.post(`/project-users`, {
    projectId: params.projectId,
    userId: params.userId,
    can_edit: params.can_edit
  }).then(res => res.data);
};

/**
 * 更新项目用户权限
 */
export const updateProjectUserRole = (projectUserId: number, can_edit: boolean): Promise<ProjectUserItem> => {
  return request.patch(`/project-users/${projectUserId}`, {
    can_edit
  }).then(res => res.data);
};

/**
 * 删除项目用户
 */
export const removeProjectUser = (projectUserId: number): Promise<void> => {
  return request.delete(`/project-users/${projectUserId}`).then(res => res.data);
};

/**
 * 获取我的项目
 */
export const getMyProjects = (): Promise<ProjectUserItem[]> => {
  return request.get('/project-users/my-projects').then(res => res.data);
}; 