import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../../database/entities/project.entity';
import { Node } from '../../database/entities/node.entity';
import { ProjectUser } from '../../database/entities/project-user.entity';
import { JwtService } from '@nestjs/jwt';
export declare class ProjectService {
    private projectRepository;
    private projectUserRepository;
    private readonly jwtService;
    constructor(projectRepository: Repository<Project>, projectUserRepository: Repository<ProjectUser>, jwtService: JwtService);
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
    verifyProject(name: string, password: string): Promise<{
        token: string;
        id: string;
        name: string;
        password: string;
        deliverables: string;
        status: ProjectStatus;
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
        nodes: Node[];
        projectUsers: ProjectUser[];
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
    copyProject(sourceId: string, newProjectName: string): Promise<Project>;
}
