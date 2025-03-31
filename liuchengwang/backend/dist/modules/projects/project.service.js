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
        console.log('开始复制项目，源ID:', sourceId, '新名称:', newProjectName);
        return await this.projectRepository.manager.transaction(async (manager) => {
            try {
                const sourceProject = await manager.findOne(project_entity_1.Project, {
                    where: { id: sourceId }
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
                const newProject = new project_entity_1.Project();
                newProject.name = newProjectName;
                newProject.password = sourceProject.password;
                newProject.deliverables = sourceProject.deliverables;
                newProject.status = project_entity_1.ProjectStatus.NOT_STARTED;
                newProject.results = sourceProject.results ? JSON.parse(JSON.stringify(sourceProject.results)) : undefined;
                newProject.created_at = new Date();
                newProject.updated_at = new Date();
                newProject.created_by = sourceProject.created_by;
                const savedProject = await manager.save(project_entity_1.Project, newProject);
                console.log('新项目创建成功，ID:', savedProject.id);
                const sourceNodes = await manager.find(node_entity_1.Node, {
                    where: { projectId: sourceId }
                });
                console.log(`找到源项目节点 ${sourceNodes.length} 个，开始复制`);
                const nodeIdMap = new Map();
                for (const sourceNode of sourceNodes) {
                    console.log(`处理源节点 ID:${sourceNode.id} 名称:${sourceNode.name}`);
                    const newNode = new node_entity_1.Node();
                    newNode.name = sourceNode.name;
                    newNode.order = sourceNode.order;
                    newNode.projectId = savedProject.id;
                    newNode.isPrerequisite = sourceNode.isPrerequisite;
                    newNode.isResult = sourceNode.isResult;
                    newNode.createdAt = new Date();
                    newNode.updatedAt = new Date();
                    const savedNode = await manager.save(node_entity_1.Node, newNode);
                    nodeIdMap.set(sourceNode.id, savedNode.id);
                    console.log(`新节点创建成功，ID:${savedNode.id} 关联到项目:${savedNode.projectId}`);
                    const sourceIssues = await manager.find(issue_entity_1.Issue, {
                        where: { node: { id: sourceNode.id } }
                    });
                    if (sourceIssues.length > 0) {
                        console.log(`找到源节点问题 ${sourceIssues.length} 个，开始复制`);
                        for (const sourceIssue of sourceIssues) {
                            const newIssue = new issue_entity_1.Issue();
                            newIssue.content = sourceIssue.content;
                            newIssue.status = sourceIssue.status || 'pending';
                            newIssue.node = savedNode;
                            newIssue.created_at = new Date();
                            newIssue.updated_at = new Date();
                            await manager.save(issue_entity_1.Issue, newIssue);
                        }
                    }
                    const sourceMaterials = await manager.find(material_entity_1.Material, {
                        where: { node: { id: sourceNode.id } }
                    });
                    if (sourceMaterials.length > 0) {
                        console.log(`找到源节点材料 ${sourceMaterials.length} 个，开始复制`);
                        for (const sourceMaterial of sourceMaterials) {
                            const newMaterial = new material_entity_1.Material();
                            newMaterial.name = sourceMaterial.name;
                            newMaterial.url = sourceMaterial.url;
                            newMaterial.type = sourceMaterial.type;
                            newMaterial.node = savedNode;
                            newMaterial.createdAt = new Date();
                            newMaterial.updatedAt = new Date();
                            await manager.save(material_entity_1.Material, newMaterial);
                        }
                    }
                    const sourceDeliverables = await manager.find(deliverable_entity_1.Deliverable, {
                        where: { node: { id: sourceNode.id } }
                    });
                    if (sourceDeliverables.length > 0) {
                        console.log(`找到源节点交付物 ${sourceDeliverables.length} 个，开始复制`);
                        for (const sourceDeliverable of sourceDeliverables) {
                            const newDeliverable = new deliverable_entity_1.Deliverable();
                            newDeliverable.description = sourceDeliverable.description;
                            newDeliverable.status = sourceDeliverable.status;
                            newDeliverable.node = savedNode;
                            newDeliverable.created_at = new Date();
                            newDeliverable.updated_at = new Date();
                            await manager.save(deliverable_entity_1.Deliverable, newDeliverable);
                        }
                    }
                }
                const sourcePrerequisites = await manager.query(`SELECT * FROM prerequisites WHERE project_id = ?`, [sourceId]);
                console.log('源项目前置条件查询结果:', JSON.stringify(sourcePrerequisites, null, 2));
                const tableStructure = await manager.query(`DESCRIBE prerequisites`);
                console.log('prerequisites表结构:', JSON.stringify(tableStructure, null, 2));
                if (sourcePrerequisites.length > 0) {
                    console.log(`找到源项目前置条件 ${sourcePrerequisites.length} 个，开始复制`);
                    console.log('节点ID映射表内容:');
                    for (const [oldId, newId] of nodeIdMap.entries()) {
                        console.log(`原节点ID: ${oldId} (${typeof oldId}) -> 新节点ID: ${newId} (${typeof newId})`);
                    }
                    for (const prerequisite of sourcePrerequisites) {
                        console.log('前置条件原始数据:', JSON.stringify(prerequisite, null, 2));
                        if (prerequisite.content) {
                            console.log('识别到项目类型的前置条件:', prerequisite.content);
                            try {
                                const newPrerequisite = {
                                    project_id: savedProject.id,
                                    content: prerequisite.content,
                                    status: prerequisite.status || 'pending',
                                    start_date: prerequisite.start_date,
                                    expected_end_date: prerequisite.expected_end_date,
                                    duration_days: prerequisite.duration_days,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                };
                                const insertResult = await manager.query(`INSERT INTO prerequisites (project_id, content, status, start_date, expected_end_date, duration_days, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                                    newPrerequisite.project_id,
                                    newPrerequisite.content,
                                    newPrerequisite.status,
                                    newPrerequisite.start_date,
                                    newPrerequisite.expected_end_date,
                                    newPrerequisite.duration_days,
                                    newPrerequisite.created_at,
                                    newPrerequisite.updated_at
                                ]);
                                console.log('项目前置条件插入成功:', insertResult);
                            }
                            catch (error) {
                                console.error('插入项目前置条件失败:', error);
                            }
                            continue;
                        }
                        let nodeId = null;
                        let prerequisiteNodeId = null;
                        for (const key in prerequisite) {
                            console.log(`检查字段 ${key}: ${prerequisite[key]}`);
                            if (key.toLowerCase().includes('node_id') || key.toLowerCase().includes('nodeid')) {
                                if (key.toLowerCase().includes('prerequisite') || key.toLowerCase().includes('pre')) {
                                    prerequisiteNodeId = prerequisite[key];
                                    console.log(`找到前置节点ID字段: ${key} = ${prerequisiteNodeId}`);
                                }
                                else {
                                    nodeId = prerequisite[key];
                                    console.log(`找到节点ID字段: ${key} = ${nodeId}`);
                                }
                            }
                        }
                        if (!nodeId || !prerequisiteNodeId) {
                            console.log('无法识别节点ID字段，尝试使用固定字段名：', prerequisite);
                            nodeId = prerequisite.node_id;
                            prerequisiteNodeId = prerequisite.prerequisite_node_id;
                        }
                        console.log(`转换前置条件 - 源节点ID: ${nodeId}, 前置节点ID: ${prerequisiteNodeId}`);
                        const newNodeId = nodeIdMap.get(Number(nodeId));
                        const newPrerequisiteNodeId = nodeIdMap.get(Number(prerequisiteNodeId));
                        console.log(`映射后的ID - 新节点ID: ${newNodeId}, 新前置节点ID: ${newPrerequisiteNodeId}`);
                        if (newNodeId && newPrerequisiteNodeId) {
                            console.log(`准备复制前置条件: 节点${newNodeId} 依赖于 节点${newPrerequisiteNodeId}`);
                            try {
                                const insertResult = await manager.query(`INSERT INTO prerequisites (project_id, node_id, prerequisite_node_id, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?)`, [savedProject.id, newNodeId, newPrerequisiteNodeId, new Date(), new Date()]);
                                console.log('前置条件插入成功:', insertResult);
                                const checkInsert = await manager.query(`SELECT * FROM prerequisites WHERE project_id = ? AND node_id = ? AND prerequisite_node_id = ?`, [savedProject.id, newNodeId, newPrerequisiteNodeId]);
                                console.log('前置条件插入检查结果:', checkInsert);
                            }
                            catch (error) {
                                console.error('插入前置条件失败:', error);
                            }
                        }
                        else {
                            console.log(`跳过前置条件复制，节点ID不存在: ${nodeId} 或 ${prerequisiteNodeId}`);
                        }
                    }
                }
                else {
                    console.log('源项目没有前置条件，无需复制');
                }
                console.log('尝试查找节点间的前置关系...');
                try {
                    const nodePrerequisites = await manager.query(`SELECT * FROM node_prerequisites WHERE node_id IN (
              SELECT id FROM nodes WHERE project_id = ?
            )`, [sourceId]).catch(err => {
                        console.log('node_prerequisites表可能不存在:', err.message);
                        return [];
                    });
                    if (nodePrerequisites.length > 0) {
                        console.log(`找到节点前置关系 ${nodePrerequisites.length} 个，开始复制`);
                        for (const relation of nodePrerequisites) {
                            const newNodeId = nodeIdMap.get(Number(relation.node_id));
                            const newPrerequisiteNodeId = nodeIdMap.get(Number(relation.prerequisite_node_id));
                            if (newNodeId && newPrerequisiteNodeId) {
                                const insertResult = await manager.query(`INSERT INTO node_prerequisites (node_id, prerequisite_node_id, created_at, updated_at)
                   VALUES (?, ?, ?, ?)`, [newNodeId, newPrerequisiteNodeId, new Date(), new Date()]).catch(err => {
                                    console.error('插入节点前置关系失败:', err.message);
                                    return null;
                                });
                                if (insertResult) {
                                    console.log('节点前置关系插入成功:', insertResult);
                                }
                            }
                        }
                    }
                    else {
                        console.log('未找到节点前置关系或node_prerequisites表不存在');
                    }
                }
                catch (error) {
                    console.log('处理节点前置关系时出错:', error.message);
                }
                const completedProject = await manager.findOne(project_entity_1.Project, {
                    where: { id: savedProject.id },
                    relations: ['nodes']
                });
                console.log(`项目复制完成，新项目节点数量: ${completedProject.nodes?.length || 0}`);
                return completedProject;
            }
            catch (error) {
                console.error('复制项目失败:', error);
                throw error;
            }
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