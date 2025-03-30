import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { ProjectUser } from '../../database/entities/project-user.entity';
export declare class RolesGuard implements CanActivate {
    private reflector;
    private projectUserRepository;
    constructor(reflector: Reflector, projectUserRepository: Repository<ProjectUser>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
