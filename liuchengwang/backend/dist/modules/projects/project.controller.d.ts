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
    }): Promise<Project>;
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
