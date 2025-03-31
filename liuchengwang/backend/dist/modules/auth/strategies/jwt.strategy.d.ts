import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Repository } from 'typeorm';
import { Project } from '../../../database/entities/project.entity';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithoutRequest] | [opt: import("passport-jwt").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly usersService;
    private readonly projectRepository;
    constructor(configService: ConfigService, usersService: UsersService, projectRepository: Repository<Project>);
    validate(payload: any): Promise<{
        id: any;
        name: any;
        type: string;
        username?: undefined;
        role?: undefined;
    } | {
        id: any;
        username: any;
        role: any;
        name?: undefined;
        type?: undefined;
    }>;
}
export {};
