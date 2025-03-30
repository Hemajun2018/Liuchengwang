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
exports.ProjectUsersController = void 0;
const common_1 = require("@nestjs/common");
const project_users_service_1 = require("./project-users.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let ProjectUsersController = class ProjectUsersController {
    constructor(projectUsersService) {
        this.projectUsersService = projectUsersService;
    }
    findAll(projectId, userId) {
        return this.projectUsersService.findAll({
            projectId,
            userId: userId ? +userId : undefined,
        });
    }
    async getMyProjects(req) {
        try {
            if (!req.user || !req.user.id) {
                throw new common_1.UnauthorizedException('未找到有效的用户信息');
            }
            const userId = Number(req.user.id);
            if (isNaN(userId) || userId <= 0) {
                console.error('无效的用户ID:', req.user.id);
                throw new common_1.UnauthorizedException('无效的用户ID');
            }
            console.log('开始获取用户项目列表, 用户ID:', userId);
            const projectUsers = await this.projectUsersService.findAll({ userId });
            const projects = projectUsers
                .filter(pu => pu.project)
                .map(pu => ({
                id: pu.project.id,
                name: pu.project.name,
                status: pu.project.status,
                can_edit: pu.can_edit
            }));
            console.log(`成功获取项目列表, 共 ${projects.length} 个项目`);
            return projects;
        }
        catch (error) {
            console.error('获取用户项目列表失败:', error);
            throw error;
        }
    }
    findOne(id) {
        return this.projectUsersService.findOne(+id);
    }
    create(createProjectUserDto) {
        return this.projectUsersService.create(createProjectUserDto);
    }
    update(id, can_edit) {
        return this.projectUsersService.update(+id, can_edit);
    }
    remove(id) {
        return this.projectUsersService.remove(+id);
    }
    removeByProjectAndUser(projectId, userId) {
        return this.projectUsersService.removeByProjectAndUser(projectId, +userId);
    }
};
exports.ProjectUsersController = ProjectUsersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.PROJECT_ADMIN),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ProjectUsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my-projects'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectUsersController.prototype, "getMyProjects", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.PROJECT_ADMIN),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectUsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.PROJECT_ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProjectUsersController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.PROJECT_ADMIN),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('can_edit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], ProjectUsersController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.PROJECT_ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectUsersController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.PROJECT_ADMIN),
    (0, common_1.Delete)('project/:projectId/user/:userId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProjectUsersController.prototype, "removeByProjectAndUser", null);
exports.ProjectUsersController = ProjectUsersController = __decorate([
    (0, common_1.Controller)('project-users'),
    __metadata("design:paramtypes", [project_users_service_1.ProjectUsersService])
], ProjectUsersController);
//# sourceMappingURL=project-users.controller.js.map