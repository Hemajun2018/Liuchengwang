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
exports.ProjectController = void 0;
const common_1 = require("@nestjs/common");
const project_service_1 = require("./project.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let ProjectController = class ProjectController {
    constructor(projectService) {
        this.projectService = projectService;
    }
    create(createProjectDto, req) {
        console.log('收到创建项目请求:', createProjectDto);
        return this.projectService.create(createProjectDto, req.user);
    }
    findAll(query, req) {
        console.log('收到获取项目列表请求, 参数:', query);
        return this.projectService.findAll({
            page: query.page ? parseInt(query.page) : undefined,
            pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
            keyword: query.keyword,
            status: query.status,
            user: req.user
        });
    }
    findOne(id) {
        console.log('收到获取单个项目请求, id:', id);
        return this.projectService.findOne(id);
    }
    update(id, updateProjectDto) {
        console.log('收到更新项目请求, id:', id);
        console.log('更新数据:', JSON.stringify(updateProjectDto, null, 2));
        if (updateProjectDto.start_time) {
            console.log('开始时间格式:', updateProjectDto.start_time, typeof updateProjectDto.start_time);
        }
        if (updateProjectDto.end_time) {
            console.log('结束时间格式:', updateProjectDto.end_time, typeof updateProjectDto.end_time);
        }
        if (updateProjectDto.days_needed !== undefined) {
            console.log('所需天数:', updateProjectDto.days_needed, typeof updateProjectDto.days_needed);
        }
        return this.projectService.update(id, updateProjectDto);
    }
    remove(id) {
        console.log('收到删除项目请求, id:', id);
        return this.projectService.remove(id);
    }
    async cloneProject(id, newProjectName) {
        console.log('收到克隆项目请求:', { id, newProjectName });
        return this.projectService.copyProject(id, newProjectName);
    }
    async copyProject(id, newProjectName) {
        console.log('收到复制项目请求:', { id, newProjectName });
        return this.projectService.copyProject(id, newProjectName);
    }
    verifyProject(data) {
        console.log('收到验证项目密码请求:', data);
        return this.projectService.verifyProject(data.name, data.password);
    }
    async updatePrerequisite(id, prerequisiteDto) {
        console.log('收到更新前置条件请求:', {
            id,
            prerequisiteDto: JSON.stringify(prerequisiteDto, null, 2)
        });
        return this.projectService.updatePrerequisite(id, prerequisiteDto);
    }
    async updateResult(id, resultDto) {
        console.log('收到更新项目成果请求:', {
            id,
            resultDto: JSON.stringify(resultDto, null, 2)
        });
        return this.projectService.updateResult(id, resultDto);
    }
};
exports.ProjectController = ProjectController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.PROJECT_ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.PROJECT_ADMIN),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)('clone'),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Body)('newProjectName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "cloneProject", null);
__decorate([
    (0, common_1.Post)('copy'),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Body)('newProjectName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "copyProject", null);
__decorate([
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProjectController.prototype, "verifyProject", null);
__decorate([
    (0, common_1.Patch)(':id/prerequisite'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "updatePrerequisite", null);
__decorate([
    (0, common_1.Patch)(':id/result'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "updateResult", null);
exports.ProjectController = ProjectController = __decorate([
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [project_service_1.ProjectService])
], ProjectController);
//# sourceMappingURL=project.controller.js.map