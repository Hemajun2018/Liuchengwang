import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserRole } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(page?: number, pageSize?: number, keyword?: string, role?: string): Promise<{
        items: {
            id: number;
            username: string;
            role: UserRole;
            realName: string;
            email?: string;
            phone?: string;
            avatar?: string;
            createdAt: Date;
            updatedAt: Date;
            projectUsers: import("../../database/entities/project-user.entity").ProjectUser[];
        }[];
        total: number;
    }>;
    searchUsers(query: string, req: any): Promise<{
        id: number;
        username: string;
        realname: string;
        role: UserRole;
        email: string;
        phone: string;
    }[]>;
    register(createUserDto: CreateUserDto): Promise<{
        id: number;
        username: string;
        role: UserRole;
        realName: string;
        email?: string;
        phone?: string;
        avatar?: string;
        createdAt: Date;
        updatedAt: Date;
        projectUsers: import("../../database/entities/project-user.entity").ProjectUser[];
    }>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: Partial<import("./entities/user.entity").User>;
    }>;
    getProfile(req: any): Promise<{
        id: number;
        username: string;
        role: UserRole;
        realName: string;
        email?: string;
        phone?: string;
        avatar?: string;
        createdAt: Date;
        updatedAt: Date;
        projectUsers: import("../../database/entities/project-user.entity").ProjectUser[];
    }>;
    findOne(id: string): Promise<{
        id: number;
        username: string;
        role: UserRole;
        realName: string;
        email?: string;
        phone?: string;
        avatar?: string;
        createdAt: Date;
        updatedAt: Date;
        projectUsers: import("../../database/entities/project-user.entity").ProjectUser[];
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity").User>;
    remove(id: string): Promise<void>;
    updatePassword(id: string, updatePasswordDto: UpdatePasswordDto, req: any): Promise<void>;
    updateRole(id: string, role: UserRole): Promise<import("./entities/user.entity").User>;
    initSuperAdmin(): Promise<{
        message: string;
    }>;
    createTestUsers(): Promise<{
        message: string;
    }>;
}
