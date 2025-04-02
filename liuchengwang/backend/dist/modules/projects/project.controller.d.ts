import { ProjectService } from './project.service';
import { Project } from '../../database/entities/project.entity';
export declare class ProjectController {
    private readonly projectService;
    constructor(projectService: ProjectService);
    create(createProjectDto: {
        name: string;
        password: string;
    }, req: any): Promise<Project>;
    findAll(query: {
        page?: string;
        pageSize?: string;
        keyword?: string;
        status?: string;
    }, req: any): Promise<{
        items: Project[];
        total: number;
    }>;
    findOne(id: string): Promise<Project>;
    update(id: string, updateProjectDto: Partial<Project>): Promise<Project>;
    remove(id: string): Promise<Project>;
    cloneProject(id: string, newProjectName: string): Promise<Project>;
    copyProject(id: string, newProjectName: string): Promise<Project>;
    verifyProject(data: {
        name: string;
        password: string;
    }): Promise<{
        token: string;
        id: string;
        name: string;
        deliverables: string;
        status: import("../../database/entities/project.entity").ProjectStatus;
        start_time: Date;
        end_time: Date;
        days_needed: number;
        results: Array<{
            id?: number;
            description: string;
        }>;
        created_by: number;
        created_at: Date;
        updated_at: Date;
        nodes: import("../../database/entities").Node[];
    }>;
    updatePrerequisite(id: string, prerequisiteDto: {
        deliverables: string;
        status: number;
    }): Promise<Project>;
    updateResult(id: string, resultDto: {
        results: Array<{
            id?: number;
            description: string;
        }>;
    }): Promise<Project>;
}
