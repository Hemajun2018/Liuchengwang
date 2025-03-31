import { Repository } from 'typeorm';
import { Project } from '../../database/entities/project.entity';
import { ProjectUser } from '../../database/entities/project-user.entity';
export declare class ProjectService {
    private projectRepository;
    private projectUserRepository;
    constructor(projectRepository: Repository<Project>, projectUserRepository: Repository<ProjectUser>);
    create(createProjectDto: {
        name: string;
        password: string;
    }, currentUser?: any): Promise<Project>;
    findAll(params?: {
        page?: number;
        pageSize?: number;
        keyword?: string;
        status?: string;
        user?: any;
    }): Promise<{
        items: Project[];
        total: number;
    }>;
    findOne(id: string): Promise<Project>;
    update(id: string, updateProjectDto: Partial<Project>): Promise<Project>;
    remove(id: string): Promise<Project>;
    verifyProject(name: string, password: string): Promise<Project>;
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
    copyProject(sourceId: string, newProjectName: string): Promise<Project>;
}
