import { Repository } from 'typeorm';
import { ProjectUser } from '../../database/entities/project-user.entity';
export declare class ProjectUsersService {
    private projectUserRepository;
    constructor(projectUserRepository: Repository<ProjectUser>);
    findAll(params: {
        projectId?: string;
        userId?: number;
    }): Promise<ProjectUser[]>;
    findOne(id: number): Promise<ProjectUser>;
    findByProjectAndUser(projectId: string, userId: number): Promise<ProjectUser>;
    create(data: {
        projectId: string;
        userId: number;
        can_edit: boolean;
    }): Promise<ProjectUser>;
    update(id: number, can_edit: boolean): Promise<ProjectUser>;
    remove(id: number): Promise<ProjectUser>;
    removeByProjectAndUser(projectId: string, userId: number): Promise<ProjectUser>;
}
