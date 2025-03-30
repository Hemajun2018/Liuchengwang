import { ProjectUser } from '../../../database/entities/project-user.entity';
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    PROJECT_ADMIN = "project_admin",
    CONTENT_ADMIN = "content_admin",
    EMPLOYEE = "employee"
}
export declare class User {
    id: number;
    username: string;
    password: string;
    role: UserRole;
    realName: string;
    email?: string;
    phone?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
    projectUsers: ProjectUser[];
}
