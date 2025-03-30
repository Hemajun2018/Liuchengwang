import { UserRole } from '../types/api';
import { getMyProjects } from '../api/projectUser';

// 判断用户是否有权限执行操作
export function hasPermission(requiredRoles: UserRole[] | UserRole, userRole?: UserRole): boolean {
  // 如果没有提供用户角色，从本地存储获取
  if (!userRole) {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      userRole = userInfo.role;
    } catch (e) {
      console.error('获取用户角色失败:', e);
      return false;
    }
  }
  
  // 如果没有用户角色，表示未登录
  if (!userRole) {
    return false;
  }
  
  // 超级管理员可以执行任何操作
  if (userRole === UserRole.SUPER_ADMIN) {
    return true;
  }
  
  // 如果传入的是数组，检查用户角色是否在所需角色列表中
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole);
  }
  
  // 如果传入的是单个角色，直接比较
  return requiredRoles === userRole;
}

// 获取角色中文名称
export function getRoleName(role: UserRole): string {
  const roleNames = {
    [UserRole.SUPER_ADMIN]: '超级管理员',
    [UserRole.PROJECT_ADMIN]: '项目管理员',
    [UserRole.CONTENT_ADMIN]: '普通管理员',
    [UserRole.EMPLOYEE]: '普通用户'
  };
  
  return roleNames[role] || '未知角色';
}

// 获取角色标签颜色
export function getRoleTagType(role: UserRole): string {
  const roleTypes = {
    [UserRole.SUPER_ADMIN]: 'danger',
    [UserRole.PROJECT_ADMIN]: 'warning',
    [UserRole.CONTENT_ADMIN]: 'success',
    [UserRole.EMPLOYEE]: 'info'
  };
  
  return roleTypes[role] || 'info';
}

// 根据当前用户角色获取可分配的角色列表
export function getAssignableRoles(currentRole: UserRole): UserRole[] {
  switch (currentRole) {
    case UserRole.SUPER_ADMIN:
      // 超级管理员可以分配任何角色
      return [
        UserRole.SUPER_ADMIN,
        UserRole.PROJECT_ADMIN,
        UserRole.CONTENT_ADMIN,
        UserRole.EMPLOYEE
      ];
    case UserRole.PROJECT_ADMIN:
      // 项目管理员只能分配内容管理员和普通用户
      return [
        UserRole.CONTENT_ADMIN,
        UserRole.EMPLOYEE
      ];
    default:
      // 其他角色无法分配
      return [];
  }
}

// 检查用户是否有项目权限
export async function hasProjectPermission(
  projectId: string,
  requireEdit: boolean = false
): Promise<boolean> {
  try {
    // 获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userRole = userInfo.role;
    
    // 超级管理员有所有项目的权限
    if (userRole === UserRole.SUPER_ADMIN) {
      return true;
    }
    
    // 获取用户的项目列表
    const projectUsers = await getMyProjects();
    
    // 找到当前项目
    const projectUser = projectUsers.find(pu => pu.project_id === projectId);
    
    // 如果未找到项目，则无权限
    if (!projectUser) {
      return false;
    }
    
    // 如果需要编辑权限，检查 can_edit 属性
    if (requireEdit && !projectUser.can_edit) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('检查项目权限出错:', error);
    return false;
  }
}

// 同步版本的项目权限检查（用于UI组件中的条件渲染）
export function hasProjectRole(
  projectUserList: any[],
  projectId: string,
  requireEdit: boolean = false
): boolean {
  try {
    // 获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userRole = userInfo.role;
    
    // 超级管理员有所有项目的权限
    if (userRole === UserRole.SUPER_ADMIN) {
      return true;
    }
    
    // 找到当前项目
    const projectUser = projectUserList.find(pu => pu.project_id === projectId);
    
    // 如果未找到项目，则无权限
    if (!projectUser) {
      return false;
    }
    
    // 如果需要编辑权限，检查 can_edit 属性
    if (requireEdit && !projectUser.can_edit) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('检查项目角色出错:', error);
    return false;
  }
} 