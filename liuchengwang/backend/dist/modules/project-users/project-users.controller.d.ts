import { ProjectUsersService } from './project-users.service';
export declare class ProjectUsersController {
    private readonly projectUsersService;
    constructor(projectUsersService: ProjectUsersService);
    findAll(projectId?: string, userId?: number): Promise<import("../../database/entities/project-user.entity").ProjectUser[]>;
    getMyProjects(req: any): Promise<{
        id: string;
        name: string;
        status: import("../../database/entities/project.entity").ProjectStatus;
        can_edit: boolean;
    }[]>;
    findOne(id: string): Promise<import("../../database/entities/project-user.entity").ProjectUser>;
    create(createProjectUserDto: {
        projectId: string;
        userId: number;
        can_edit: boolean;
    }): Promise<import("../../database/entities/project-user.entity").ProjectUser>;
    update(id: string, can_edit: boolean): Promise<import("../../database/entities/project-user.entity").ProjectUser>;
    remove(id: string): Promise<import("../../database/entities/project-user.entity").ProjectUser>;
    removeByProjectAndUser(projectId: string, userId: string): Promise<import("../../database/entities/project-user.entity").ProjectUser>;
}
