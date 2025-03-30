import request from '../utils/request';

export enum NodeStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  DELAYED = 'delayed'
}

export enum IssueStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved'
}

export enum IssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Progress {
  id: number;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface Node {
  id: number;
  projectId: string;
  name: string;
  order: number;
  isPrerequisite: boolean;
  isResult: boolean;
  createdAt: Date;
  updatedAt: Date;
  issues: Issue[];
  materials: Material[];
  deliverables: any[];
}

export interface Issue {
  id: number;
  node_id: number;
  content: string;
  status: IssueStatus;
  start_date: string | null;
  expected_end_date: string | null;
  duration_days: number | null;
  created_at: Date;
  updated_at: Date;
  
  // 为兼容前端代码添加别名字段
  startDate?: string | null;
  endDate?: string | null;
  durationDays?: number | null;
}

export interface Material {
  id: number;
  node_id: number;
  name: string;
  description: string;
  start_date: Date | string | null;
  expected_end_date: Date | string | null;
  duration_days: number | null;
  status: NodeStatus;
  created_at: Date;
  updated_at: Date;
  
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  durationDays?: number;
}

export interface NodeListResponse {
  items: Node[];
  total: number;
}

/**
 * 创建节点
 */
export const createNode = (projectId: string, data: {
  name: string;
  order: number;
  isPrerequisite?: boolean;
  isResult?: boolean;
}): Promise<Node> => {
  return request({
    url: `/projects/${projectId}/nodes`,
    method: 'post',
    data
  }).then(response => response.data);
};

/**
 * 获取节点列表
 */
export const getNodeList = (projectId: string): Promise<Node[]> => {
  return request({
    url: `/projects/${projectId}/nodes`,
    method: 'get'
  }).then(response => {
    const nodes = response.data;
    
    // 处理材料字段映射，确保前端代码兼容性
    nodes.forEach((node: Node) => {
      if (node.materials && node.materials.length > 0) {
        node.materials.forEach((material: Material) => {
          // 添加别名字段
          material.startDate = material.start_date;
          material.endDate = material.expected_end_date;
          material.durationDays = material.duration_days || 0;
        });
      }
    });
    
    return nodes;
  });
};

/**
 * 获取单个节点详情
 */
export const getNode = (projectId: string, nodeId: number): Promise<Node> => {
  return request({
    url: `/projects/${projectId}/nodes/${nodeId}`,
    method: 'get'
  }).then(response => {
    const node = response.data;
    
    // 处理材料字段映射，确保前端代码兼容性
    if (node.materials && node.materials.length > 0) {
      node.materials.forEach((material: Material) => {
        // 添加别名字段
        material.startDate = material.start_date;
        material.endDate = material.expected_end_date;
        material.durationDays = material.duration_days || 0;
      });
    }
    
    return node;
  });
};

/**
 * 更新节点信息
 */
export const updateNode = (projectId: string, nodeId: number, data: Partial<Node>): Promise<Node> => {
  return request({
    url: `/projects/${projectId}/nodes/${nodeId}`,
    method: 'patch',
    data
  }).then(response => response.data);
};

/**
 * 删除节点
 */
export const deleteNode = (projectId: string, nodeId: number): Promise<void> => {
  return request({
    url: `/projects/${projectId}/nodes/${nodeId}`,
    method: 'delete'
  }).then(response => response.data);
};

/**
 * 更新节点顺序
 */
export const updateNodeOrder = (projectId: string, nodeIds: number[]): Promise<void> => {
  return request({
    url: `/projects/${projectId}/nodes/reorder`,
    method: 'post',
    data: { nodeIds }
  }).then(response => response.data);
};

/**
 * 获取节点问题列表
 */
export const getIssueList = (projectId: string, nodeId: number): Promise<Issue[]> => {
  return request({
    url: `/projects/${projectId}/nodes/${nodeId}/issues`,
    method: 'get'
  }).then(response => {
    const issues = response.data;
    
    // 处理问题字段映射，确保前端代码兼容性
    issues.forEach((issue: Issue) => {
      // 添加别名字段
      issue.startDate = issue.start_date;
      issue.endDate = issue.expected_end_date;
      issue.durationDays = issue.duration_days;
    });
    
    return issues;
  });
};

/**
 * 创建节点问题
 */
export const createIssue = (projectId: string, nodeId: number, data: {
  content: string;
  status: IssueStatus;
  start_date?: string | null;
  expected_end_date?: string | null;
  duration_days?: number | null;
}): Promise<Issue> => {
  if (!data.content || data.content.trim() === '') {
    return Promise.reject(new Error('问题描述不能为空'));
  }
  
  return request({
    url: `/projects/${projectId}/nodes/${nodeId}/issues`,
    method: 'post',
    data
  }).then(response => response.data);
};

/**
 * 更新节点问题
 */
export const updateIssue = (projectId: string, nodeId: number, issueId: number, data: {
  content?: string;
  status?: IssueStatus;
  start_date?: string | null;
  expected_end_date?: string | null;
  duration_days?: number | null;
}): Promise<Issue> => {
  return request({
    url: `/projects/${projectId}/nodes/${nodeId}/issues/${issueId}`,
    method: 'patch',
    data
  }).then(response => response.data);
};

/**
 * 删除节点问题
 */
export const deleteIssue = (projectId: string, nodeId: number, issueId: number): Promise<void> => {
  return request({
    url: `/projects/${projectId}/nodes/${nodeId}/issues/${issueId}`,
    method: 'delete'
  }).then(response => response.data);
};

/**
 * 获取单个问题详情
 */
export const getIssue = (projectId: string, nodeId: number, issueId: number): Promise<Issue> => {
  return request({
    url: `/projects/${projectId}/nodes/${nodeId}/issues/${issueId}`,
    method: 'get'
  }).then(response => response.data);
};

/**
 * 创建节点材料
 */
export const createNodeMaterial = (projectId: string, nodeId: number, data: {
  name: string;
  description: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  durationDays: number;
  status: NodeStatus;
}): Promise<Material> => {
  // 转换字段名以匹配后端API期望的格式
  const apiData = {
    name: data.name,
    description: data.description,
    start_date: data.startDate,
    expected_end_date: data.endDate,
    duration_days: data.durationDays,
    status: data.status
  };

  return request({
    url: `/projects/${projectId}/nodes/${nodeId}/materials`,
    method: 'post',
    data: apiData
  }).then(response => {
    const material = response.data;
    // 添加别名字段
    material.startDate = material.start_date;
    material.endDate = material.expected_end_date;
    material.durationDays = material.duration_days || 0;
    return material;
  });
};

/**
 * 更新节点材料
 */
export const updateNodeMaterial = (projectId: string, nodeId: number, materialId: number, data: Partial<Material>): Promise<Material> => {
  // 转换字段名以匹配后端API期望的格式
  const apiData: any = { ...data };
  
  // 如果存在前端字段名，转换为后端字段名
  if (data.startDate !== undefined) {
    apiData.start_date = data.startDate;
    delete apiData.startDate;
  }
  
  if (data.endDate !== undefined) {
    apiData.expected_end_date = data.endDate;
    delete apiData.endDate;
  }
  
  if (data.durationDays !== undefined) {
    apiData.duration_days = data.durationDays;
    delete apiData.durationDays;
  }

  return request({
    url: `/projects/${projectId}/nodes/${nodeId}/materials/${materialId}`,
    method: 'patch',
    data: apiData
  }).then(response => {
    const material = response.data;
    // 添加别名字段
    material.startDate = material.start_date;
    material.endDate = material.expected_end_date;
    material.durationDays = material.duration_days || 0;
    return material;
  });
};

/**
 * 删除节点材料
 */
export const deleteNodeMaterial = (projectId: string, nodeId: number, materialId: number): Promise<void> => {
  return request({
    url: `/projects/${projectId}/nodes/${nodeId}/materials/${materialId}`,
    method: 'delete'
  }).then(response => response.data);
}; 