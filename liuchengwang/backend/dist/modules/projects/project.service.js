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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("../../database/entities/project.entity");
const bcrypt = require("bcrypt");
const node_entity_1 = require("../../database/entities/node.entity");
const issue_entity_1 = require("../../database/entities/issue.entity");
const material_entity_1 = require("../../database/entities/material.entity");
const deliverable_entity_1 = require("../../database/entities/deliverable.entity");
const project_user_entity_1 = require("../../database/entities/project-user.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const typeorm_3 = require("typeorm");
let ProjectService = class ProjectService {
    constructor(projectRepository, projectUserRepository) {
        this.projectRepository = projectRepository;
        this.projectUserRepository = projectUserRepository;
    }
    async create(createProjectDto, currentUser) {
        console.log('创建项目请求数据:', createProjectDto);
        const existingProject = await this.projectRepository.findOne({
            where: { name: createProjectDto.name }
        });
        if (existingProject) {
            console.log('项目名称已存在:', existingProject);
            throw new common_1.ConflictException('项目名称已存在');
        }
        const projectData = {
            name: createProjectDto.name,
            password: await bcrypt.hash(createProjectDto.password, 10),
            status: project_entity_1.ProjectStatus.NOT_STARTED,
            days_needed: 0,
            created_by: currentUser?.id ? Number(currentUser.id) : null
        };
        const project = this.projectRepository.create(projectData);
        console.log('准备保存的项目数据:', project);
        try {
            const savedProject = await this.projectRepository.save(project);
            console.log('保存成功，返回数据:', savedProject);
            if (currentUser && currentUser.id) {
                try {
                    await this.projectUserRepository.save({
                        project_id: savedProject.id,
                        user_id: currentUser.id,
                        can_edit: true
                    });
                }
                catch (error) {
                    console.error('创建项目用户关联失败:', error);
                }
            }
            return savedProject;
        }
        catch (error) {
            console.error('保存项目时出错:', error);
            throw error;
        }
    }
    async findAll(params) {
        try {
            const { page = 1, pageSize = 10, keyword, status, user } = params || {};
            console.log('开始查询项目列表，用户信息:', {
                用户ID: user?.id,
                用户角色: user?.role
            });
            const queryBuilder = this.projectRepository
                .createQueryBuilder('project')
                .select([
                'project.id',
                'project.name',
                'project.status',
                'project.deliverables',
                'project.start_time',
                'project.end_time',
                'project.days_needed',
                'project.created_at',
                'project.updated_at',
                'project.created_by'
            ]);
            if (user && user.role !== user_entity_1.UserRole.SUPER_ADMIN) {
                queryBuilder
                    .leftJoin('project.projectUsers', 'projectUser')
                    .where(new typeorm_3.Brackets(qb => {
                    qb.where('project.created_by = :userId', { userId: Number(user.id) })
                        .orWhere('projectUser.user_id = :userId', { userId: Number(user.id) });
                }))
                    .distinct(true);
                const [sql, parameters] = queryBuilder.getQueryAndParameters();
                console.log('SQL查询:', sql);
                console.log('SQL参数:', parameters);
            }
            if (keyword) {
                queryBuilder.andWhere('project.name LIKE :keyword', { keyword: `%${keyword}%` });
            }
            if (status) {
                queryBuilder.andWhere('project.status = :status', { status });
            }
            const total = await queryBuilder.getCount();
            const items = await queryBuilder
                .orderBy('project.created_at', 'DESC')
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getMany();
            console.log('查询结果:', {
                总数: total,
                当前页数据量: items.length,
                查询条件: {
                    keyword,
                    status,
                    page,
                    pageSize
                },
                项目列表: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    created_by: item.created_by ? Number(item.created_by) : null
                }))
            });
            return {
                items,
                total
            };
        }
        catch (error) {
            console.error('获取项目列表失败:', error);
            throw error;
        }
    }
    async findOne(id) {
        console.log('查询单个项目，ID:', id);
        const project = await this.projectRepository.findOne({
            where: { id }
        });
        if (!project) {
            console.log('项目不存在');
            throw new common_1.NotFoundException('项目不存在');
        }
        console.log('查询到的项目:', project);
        return project;
    }
    async update(id, updateProjectDto) {
        console.log('开始更新项目, ID:', id);
        console.log('更新数据:', JSON.stringify(updateProjectDto, null, 2));
        const project = await this.findOne(id);
        console.log('找到现有项目:', JSON.stringify(project, null, 2));
        if (updateProjectDto.password) {
            updateProjectDto.password = await bcrypt.hash(updateProjectDto.password, 10);
        }
        if (updateProjectDto.start_time) {
            console.log('处理开始时间:', updateProjectDto.start_time);
            updateProjectDto.start_time = new Date(updateProjectDto.start_time);
        }
        if (updateProjectDto.end_time) {
            console.log('处理结束时间:', updateProjectDto.end_time);
            updateProjectDto.end_time = new Date(updateProjectDto.end_time);
        }
        Object.assign(project, updateProjectDto);
        console.log('合并后的数据:', JSON.stringify(project, null, 2));
        try {
            const updatedProject = await this.projectRepository.save(project);
            console.log('更新成功,返回数据:', JSON.stringify(updatedProject, null, 2));
            return updatedProject;
        }
        catch (error) {
            console.error('更新失败:', error);
            throw error;
        }
    }
    async remove(id) {
        console.log('删除项目，ID:', id);
        try {
            const project = await this.findOne(id);
            const deletePrerequisitesResult = await this.projectRepository.manager.query(`DELETE FROM prerequisites WHERE project_id = ?`, [id]);
            console.log('删除前置条件结果:', deletePrerequisitesResult);
            const result = await this.projectRepository.remove(project);
            console.log('项目删除成功，返回数据:', result);
            return result;
        }
        catch (error) {
            console.error('删除项目失败:', error);
            throw error;
        }
    }
    async verifyProject(name, password) {
        console.log('验证项目密码，项目名:', name);
        const project = await this.projectRepository.findOne({
            where: { name }
        });
        if (!project) {
            console.log('项目不存在');
            throw new common_1.NotFoundException('项目不存在');
        }
        const isPasswordValid = await bcrypt.compare(password, project.password);
        if (!isPasswordValid) {
            console.log('项目密码错误');
            throw new common_1.NotFoundException('项目密码错误');
        }
        console.log('验证成功，返回数据:', project);
        return project;
    }
    async updatePrerequisite(id, prerequisiteDto) {
        console.log('开始更新项目前置条件, ID:', id);
        console.log('前置条件数据:', JSON.stringify(prerequisiteDto, null, 2));
        const project = await this.findOne(id);
        let status = prerequisiteDto.status;
        if (status === null || status === undefined) {
            status = 0;
            console.log('状态值为null或undefined，已设置为默认值0');
        }
        project.deliverables = prerequisiteDto.deliverables;
        project.status = status;
        console.log('准备保存的项目数据:', JSON.stringify({
            deliverables: project.deliverables,
            status: project.status
        }, null, 2));
        try {
            const updatedProject = await this.projectRepository.save(project);
            console.log('前置条件更新成功,返回数据:', JSON.stringify(updatedProject, null, 2));
            return updatedProject;
        }
        catch (error) {
            console.error('更新前置条件失败:', error);
            throw error;
        }
    }
    async updateResult(id, resultDto) {
        console.log('开始更新项目成果, ID:', id);
        console.log('成果数据:', JSON.stringify(resultDto, null, 2));
        const project = await this.findOne(id);
        project.results = resultDto.results;
        console.log('准备保存的项目数据:', JSON.stringify({
            results: project.results
        }, null, 2));
        try {
            const updatedProject = await this.projectRepository.save(project);
            console.log('成果更新成功,返回数据:', JSON.stringify(updatedProject, null, 2));
            return updatedProject;
        }
        catch (error) {
            console.error('更新成果失败:', error);
            throw error;
        }
    }
    async copyProject(sourceId, newProjectName) {
        return await this.projectRepository.manager.transaction(async (manager) => {
            const sourceProject = await manager.findOne(project_entity_1.Project, {
                where: { id: sourceId },
                relations: ['nodes', 'nodes.issues', 'nodes.materials', 'nodes.deliverables']
            });
            if (!sourceProject) {
                throw new common_1.NotFoundException('源项目不存在');
            }
            const existingProject = await manager.findOne(project_entity_1.Project, {
                where: { name: newProjectName }
            });
            if (existingProject) {
                throw new common_1.ConflictException('项目名称已存在');
            }
            const newProject = manager.create(project_entity_1.Project, {
                ...sourceProject,
                id: undefined,
                name: newProjectName,
                password: sourceProject.password,
                created_at: new Date(),
                updated_at: new Date(),
                status: project_entity_1.ProjectStatus.NOT_STARTED,
                days_needed: sourceProject.days_needed,
                created_by: sourceProject.created_by ? Number(sourceProject.created_by) : null
            });
            const savedProject = await manager.save(project_entity_1.Project, newProject);
            if (sourceProject.nodes) {
                for (const sourceNode of sourceProject.nodes) {
                    const newNode = manager.create(node_entity_1.Node, {
                        ...sourceNode,
                        id: undefined,
                        projectId: savedProject.id,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                    const savedNode = await manager.save(node_entity_1.Node, newNode);
                    if (sourceNode.issues) {
                        for (const issue of sourceNode.issues) {
                            await manager.save(issue_entity_1.Issue, {
                                ...issue,
                                id: undefined,
                                nodeId: savedNode.id,
                                created_at: new Date(),
                                updated_at: new Date()
                            });
                        }
                    }
                    if (sourceNode.materials) {
                        for (const material of sourceNode.materials) {
                            await manager.save(material_entity_1.Material, {
                                ...material,
                                id: undefined,
                                nodeId: savedNode.id,
                                created_at: new Date(),
                                updated_at: new Date()
                            });
                        }
                    }
                    if (sourceNode.deliverables) {
                        for (const deliverable of sourceNode.deliverables) {
                            await manager.save(deliverable_entity_1.Deliverable, {
                                ...deliverable,
                                id: undefined,
                                nodeId: savedNode.id,
                                created_at: new Date(),
                                updated_at: new Date()
                            });
                        }
                    }
                }
            }
            return savedProject;
        });
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_user_entity_1.ProjectUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProjectService);
//# sourceMappingURL=project.service.js.map