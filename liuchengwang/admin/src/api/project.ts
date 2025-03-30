import request from '../utils/request';
import { NodeStatus } from './node';
import type { ProjectDetail, ProjectListResponse as TypeProjectListResponse } from '@/types/project';

// 项目类型定义
export interface Project {
  id: string;
  name: string;
  password: string;
  deliverables: string | null;
  status: number;
  results?: Array<{
    id?: number;
    description: string;
  }>;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

// 添加一个适配器函数，将Project转换为ProjectDetail
export function adaptProjectToProjectDetail(project: Project): ProjectDetail {
  return {
    id: project.id,
    name: project.name,
    password: project.password,
    deliverables: project.deliverables || '',
    status: project.status,
    // 安全地转换不存在的字段，使用类型断言或提供默认值
    start_time: (project as any).start_time || null,
    end_time: (project as any).end_time || null,
    days_needed: (project as any).days_needed || 0, // 提供默认值
    results: project.results || [],
    created_by: project.created_by || 0, // 添加created_by字段处理
    created_at: project.created_at,
    updated_at: project.updated_at
  };
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
}

export interface ProjectPrerequisite {
  deliverables: string | null;
  status: number;
}

export interface ProjectResult {
  results: Array<{
    id?: number;
    description: string;
  }>;
}

/**
 * 创建项目
 */
export const createProject = (data: {
  name: string;
  password: string;
} | Partial<ProjectDetail>): Promise<Project> => {
  return request({
    url: '/projects',
    method: 'post',
    data
  }).then(response => response.data);
};

/**
 * 获取项目列表
 */
export const getProjectList = (params?: {
  page?: number;
  page_size?: number;
  keyword?: string;
  status?: NodeStatus;
}): Promise<ProjectListResponse> => {
  return request({
    url: '/projects',
    method: 'get',
    params
  }).then(response => response.data);
};

/**
 * 获取单个项目详情
 */
export const getProject = (id: string | number): Promise<Project> => {
  return request({
    url: `/projects/${id}`,
    method: 'get'
  }).then(response => response.data);
};

/**
 * 更新项目信息
 */
export const updateProject = (id: string | number, data: Partial<Project> | Partial<ProjectDetail>): Promise<Project> => {
  return request({
    url: `/projects/${id}`,
    method: 'patch',
    data
  }).then(response => response.data);
};

/**
 * 删除项目
 */
export const deleteProject = (id: string | number): Promise<void> => {
  return request({
    url: `/projects/${id}`,
    method: 'delete'
  }).then(response => response.data);
};

/**
 * 验证项目密码
 */
export const verifyProject = (data: {
  name: string;
  password: string;
}): Promise<Project> => {
  return request({
    url: '/projects/verify',
    method: 'post',
    data
  }).then(response => response.data);
};

/**
 * 更新项目前置条件
 */
export const updateProjectPrerequisite = (id: string, data: ProjectPrerequisite): Promise<Project> => {
  console.log('发送更新前置条件请求:', {
    url: `/projects/${id}/prerequisite`,
    method: 'patch',
    data: JSON.stringify(data)
  });
  
  return request({
    url: `/projects/${id}/prerequisite`,
    method: 'patch',
    data
  }).then(response => response.data);
};

/**
 * 更新项目成果
 */
export const updateProjectResult = (id: string, data: ProjectResult): Promise<Project> => {
  return request({
    url: `/projects/${id}/result`,
    method: 'patch',
    data
  }).then(response => response.data);
};

/**
 * 复制项目
 */
export function copyProject(id: string, newProjectName: string): Promise<Project> {
  return request({
    url: `/projects/copy?id=${id}`,
    method: 'post',
    data: { newProjectName }
  }).then(response => response.data);
}

/**
 * 克隆项目（使用新的接口）
 */
export function cloneProject(id: string, newProjectName: string): Promise<Project> {
  return request({
    url: `/projects/clone?id=${id}`,
    method: 'put',
    data: { newProjectName }
  }).then(response => response.data);
}

/**
 * 获取项目列表
 * @param page 页码
 * @param limit 每页数量
 * @param search 搜索关键字
 */
export const getProjects = (page = 1, limit = 10, search = '') => {
  return request<TypeProjectListResponse>({
    url: '/projects',
    method: 'get',
    params: { page, limit, search }
  });
};

/**
 * 获取当前用户的项目列表
 */
export const getMyProjects = () => {
  return request<TypeProjectListResponse>({
    url: '/projects/my',
    method: 'get'
  });
};

/**
 * 获取已分配的项目列表
 */
export const getAssignedProjects = () => {
  return request.get('/project-users/my-projects').then(res => {
    // 确保返回的是数组
    if (!Array.isArray(res.data)) {
      console.warn('获取到的项目数据格式不正确:', res.data);
      return [];
    }
    return res.data;
  });
}; 