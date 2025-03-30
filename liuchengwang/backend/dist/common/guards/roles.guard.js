"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const user_entity_1 = require("../../modules/users/entities/user.entity");
const roles_decorator_1 = require("../decorators/roles.decorator");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_user_entity_1 = require("../../database/entities/project-user.entity");
let RolesGuard = class RolesGuard {
    constructor(reflector, projectUserRepository) {
        this.reflector = reflector;
        this.projectUserRepository = projectUserRepository;
    }
    async canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('未授权访问');
        }
        if (user.role === user_entity_1.UserRole.SUPER_ADMIN) {
            return true;
        }
        const hasRequiredRole = requiredRoles.includes(user.role);
        if (hasRequiredRole) {
            return true;
        }
        const projectId = request.params.id || request.query.projectId;
        if (projectId && (user.role === user_entity_1.UserRole.PROJECT_ADMIN || user.role === user_entity_1.UserRole.CONTENT_ADMIN)) {
            const projectUser = await this.projectUserRepository.findOne({
                where: { project_id: projectId, user_id: user.id }
            });
            if (projectUser) {
                if (user.role === user_entity_1.UserRole.PROJECT_ADMIN) {
                    return true;
                }
                if (user.role === user_entity_1.UserRole.CONTENT_ADMIN &&
                    !['PUT', 'PATCH', 'DELETE'].includes(request.method)) {
                    return true;
                }
            }
        }
        throw new common_1.ForbiddenException('您没有权限执行此操作');
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(project_user_entity_1.ProjectUser)),
    __metadata("design:paramtypes", [core_1.Reflector,
        typeorm_2.Repository])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map