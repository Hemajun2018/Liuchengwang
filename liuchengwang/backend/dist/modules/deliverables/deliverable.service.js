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
var DeliverableService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliverableService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const deliverable_entity_1 = require("../../database/entities/deliverable.entity");
const node_entity_1 = require("../../database/entities/node.entity");
let DeliverableService = DeliverableService_1 = class DeliverableService {
    constructor(deliverableRepository, nodeRepository) {
        this.deliverableRepository = deliverableRepository;
        this.nodeRepository = nodeRepository;
        this.logger = new common_1.Logger(DeliverableService_1.name);
    }
    async findAll(projectId, nodeId) {
        this.logger.log(`查询节点交付内容列表, 项目ID: ${projectId}, 节点ID: ${nodeId}`);
        try {
            const node = await this.nodeRepository.findOne({
                where: { id: nodeId, projectId }
            });
            if (!node) {
                this.logger.warn(`节点不存在或不属于该项目, 项目ID: ${projectId}, 节点ID: ${nodeId}`);
                throw new common_1.NotFoundException(`节点 #${nodeId} 不存在或不属于该项目`);
            }
            const deliverables = await this.deliverableRepository.find({
                where: { node_id: nodeId },
                order: { id: 'ASC' }
            });
            this.logger.debug(`找到 ${deliverables.length} 个交付内容`);
            this.logger.debug(`交付内容列表: ${JSON.stringify(deliverables)}`);
            return deliverables;
        }
        catch (error) {
            this.logger.error(`查询节点交付内容列表失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findOne(projectId, nodeId, deliverableId) {
        this.logger.log(`查询交付内容, 项目ID: ${projectId}, 节点ID: ${nodeId}, 交付内容ID: ${deliverableId}`);
        try {
            const node = await this.nodeRepository.findOne({
                where: { id: nodeId, projectId }
            });
            if (!node) {
                this.logger.warn(`节点不存在或不属于该项目, 项目ID: ${projectId}, 节点ID: ${nodeId}`);
                throw new common_1.NotFoundException(`节点 #${nodeId} 不存在或不属于该项目`);
            }
            const deliverable = await this.deliverableRepository.findOne({
                where: { id: deliverableId, node_id: nodeId }
            });
            if (!deliverable) {
                this.logger.warn(`交付内容不存在, ID: ${deliverableId}`);
                throw new common_1.NotFoundException(`交付内容 #${deliverableId} 不存在`);
            }
            return deliverable;
        }
        catch (error) {
            this.logger.error(`查询交付内容失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async create(projectId, nodeId, data) {
        this.logger.log(`创建交付内容, 项目ID: ${projectId}, 节点ID: ${nodeId}`);
        this.logger.log(`创建数据: ${JSON.stringify(data, null, 2)}`);
        try {
            const node = await this.nodeRepository.findOne({
                where: { id: nodeId, projectId }
            });
            if (!node) {
                this.logger.warn(`节点不存在或不属于该项目, 项目ID: ${projectId}, 节点ID: ${nodeId}`);
                throw new common_1.NotFoundException(`节点 #${nodeId} 不存在或不属于该项目`);
            }
            let duration_days = data.duration_days;
            if (data.start_date && data.expected_end_date) {
                const start = new Date(data.start_date);
                const end = new Date(data.expected_end_date);
                if (end < start) {
                    throw new Error('结束日期不能早于开始日期');
                }
                const diffTime = Math.abs(end.getTime() - start.getTime());
                duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            const deliverable = this.deliverableRepository.create({
                node_id: nodeId,
                description: data.description,
                start_date: data.start_date ? new Date(data.start_date) : null,
                expected_end_date: data.expected_end_date ? new Date(data.expected_end_date) : null,
                duration_days: duration_days,
                status: data.status || deliverable_entity_1.DeliverableStatus.NOT_STARTED
            });
            const savedDeliverable = await this.deliverableRepository.save(deliverable);
            this.logger.log(`交付内容创建成功: ${JSON.stringify(savedDeliverable, null, 2)}`);
            return savedDeliverable;
        }
        catch (error) {
            this.logger.error(`创建交付内容失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async update(projectId, nodeId, deliverableId, data) {
        this.logger.log(`更新交付内容, 项目ID: ${projectId}, 节点ID: ${nodeId}, 交付内容ID: ${deliverableId}`);
        this.logger.log(`更新数据: ${JSON.stringify(data, null, 2)}`);
        try {
            const deliverable = await this.findOne(projectId, nodeId, deliverableId);
            if (data.description !== undefined)
                deliverable.description = data.description;
            if (data.start_date !== undefined)
                deliverable.start_date = data.start_date ? new Date(data.start_date) : null;
            if (data.expected_end_date !== undefined)
                deliverable.expected_end_date = data.expected_end_date ? new Date(data.expected_end_date) : null;
            if (data.status !== undefined)
                deliverable.status = data.status;
            if (deliverable.start_date && deliverable.expected_end_date) {
                const diffTime = Math.abs(deliverable.expected_end_date.getTime() - deliverable.start_date.getTime());
                deliverable.duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            else if (data.duration_days !== undefined) {
                deliverable.duration_days = data.duration_days;
            }
            const updatedDeliverable = await this.deliverableRepository.save(deliverable);
            this.logger.log(`交付内容更新成功: ${JSON.stringify(updatedDeliverable, null, 2)}`);
            return updatedDeliverable;
        }
        catch (error) {
            this.logger.error(`更新交付内容失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async remove(projectId, nodeId, deliverableId) {
        this.logger.log(`删除交付内容, 项目ID: ${projectId}, 节点ID: ${nodeId}, 交付内容ID: ${deliverableId}`);
        try {
            const deliverable = await this.findOne(projectId, nodeId, deliverableId);
            const deleteResult = await this.deliverableRepository.delete(deliverableId);
            if (deleteResult.affected === 0) {
                throw new Error('交付内容删除失败');
            }
            this.logger.log('交付内容删除成功');
        }
        catch (error) {
            this.logger.error(`删除交付内容失败: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeliverableService = DeliverableService;
exports.DeliverableService = DeliverableService = DeliverableService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(deliverable_entity_1.Deliverable)),
    __param(1, (0, typeorm_1.InjectRepository)(node_entity_1.Node)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DeliverableService);
//# sourceMappingURL=deliverable.service.js.map