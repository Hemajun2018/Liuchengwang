import { Node } from './node.entity';
import { ProjectUser } from './project-user.entity';
export declare enum ProjectStatus {
    NOT_STARTED = 0,
    IN_PROGRESS = 1,
    COMPLETED = 2,
    DELAYED = 3
}
export declare class Project {
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
}
