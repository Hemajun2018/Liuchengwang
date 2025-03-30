import { Project } from './project.entity';
import { User } from '../../modules/users/entities/user.entity';
export declare class ProjectUser {
    id: number;
    project_id: string;
    user_id: number;
    can_edit: boolean;
    createdAt: Date;
    updatedAt: Date;
    project: Project;
    user: User;
}
