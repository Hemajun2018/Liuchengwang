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
exports.ProjectUsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_user_entity_1 = require("../../database/entities/project-user.entity");
let ProjectUsersService = class ProjectUsersService {
    constructor(projectUserRepository) {
        this.projectUserRepository = projectUserRepository;
    }
    async findAll(params) {
        const { projectId, userId } = params;
        console.log('开始查询项目用户, 参数:', params);
        try {
            const where = {};
            if (projectId) {
                where.project_id = projectId;
            }
            if (userId) {
                const numericUserId = Number(userId);
                if (isNaN(numericUserId) || numericUserId <= 0) {
                    console.warn('无效的用户ID:', userId);
                    return [];
                }
                where.user_id = numericUserId;
            }
            const projectUsers = await this.projectUserRepository.find({
                where,
                relations: ['user', 'project'],
                order: {
                    createdAt: 'DESC'
                }
            });
            console.log(`查询完成, 找到 ${projectUsers.length} 条记录`);
            return projectUsers;
        }
        catch (error) {
            console.error('查询项目用户时出错:', error);
            console.error('错误详情:', {
                message: error.message,
                stack: error.stack,
                params
            });
            throw error;
        }
    }
    async findOne(id) {
        try {
            if (id === undefined || id === null) {
                throw new common_1.NotFoundException('项目用户ID不能为空');
            }
            const numericId = Number(id);
            if (isNaN(numericId) || numericId <= 0) {
                throw new common_1.NotFoundException(`无效的项目用户ID: ${id}`);
            }
            const projectUser = await this.projectUserRepository.findOneBy({
                id: numericId
            });
            if (!projectUser) {
                throw new common_1.NotFoundException(`未找到ID为 ${id} 的项目用户关联`);
            }
            const projectUserWithRelations = await this.projectUserRepository.findOne({
                where: { id: numericId },
                relations: ['user', 'project']
            });
            return projectUserWithRelations;
        }
        catch (error) {
            console.error('查询项目用户失败:', error);
            throw error;
        }
    }
    async findByProjectAndUser(projectId, userId) {
        if (!projectId || !userId) {
            throw new common_1.NotFoundException('项目ID和用户ID不能为空');
        }
        const numericUserId = Number(userId);
        if (isNaN(numericUserId) || numericUserId <= 0) {
            throw new common_1.NotFoundException(`无效的用户ID: ${userId}`);
        }
        return this.projectUserRepository.findOne({
            where: {
                project_id: projectId,
                user_id: numericUserId
            },
            relations: ['user', 'project']
        });
    }
    async create(data) {
        const { projectId, userId, can_edit } = data;
        const existingRecord = await this.projectUserRepository.findOne({
            where: { project_id: projectId, user_id: userId },
        });
        if (existingRecord) {
            existingRecord.can_edit = can_edit;
            return this.projectUserRepository.save(existingRecord);
        }
        const projectUser = this.projectUserRepository.create({
            project_id: projectId,
            user_id: userId,
            can_edit,
        });
        return this.projectUserRepository.save(projectUser);
    }
    async update(id, can_edit) {
        const projectUser = await this.findOne(id);
        projectUser.can_edit = can_edit;
        return this.projectUserRepository.save(projectUser);
    }
    async remove(id) {
        const projectUser = await this.findOne(id);
        return this.projectUserRepository.remove(projectUser);
    }
    async removeByProjectAndUser(projectId, userId) {
        const projectUser = await this.findByProjectAndUser(projectId, userId);
        if (!projectUser) {
            throw new common_1.NotFoundException(`未找到项目ID ${projectId} 和用户ID ${userId} 的关联`);
        }
        return this.projectUserRepository.remove(projectUser);
    }
};
exports.ProjectUsersService = ProjectUsersService;
exports.ProjectUsersService = ProjectUsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_user_entity_1.ProjectUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProjectUsersService);
//# sourceMappingURL=project-users.service.js.map