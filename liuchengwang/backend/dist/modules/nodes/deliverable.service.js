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
exports.DeliverableService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const deliverable_entity_1 = require("../../database/entities/deliverable.entity");
const date_fns_1 = require("date-fns");
let DeliverableService = class DeliverableService {
    constructor(deliverableRepository) {
        this.deliverableRepository = deliverableRepository;
    }
    async create(nodeId, createDeliverableDto) {
        console.log('创建交付内容:', createDeliverableDto);
        const deliverable = this.deliverableRepository.create({
            ...createDeliverableDto,
            node_id: nodeId
        });
        if (createDeliverableDto.start_date && createDeliverableDto.expected_end_date) {
            const startDate = new Date(createDeliverableDto.start_date);
            const endDate = new Date(createDeliverableDto.expected_end_date);
            deliverable.duration_days = (0, date_fns_1.differenceInDays)(endDate, startDate);
        }
        return this.deliverableRepository.save(deliverable);
    }
    async findAll(nodeId) {
        console.log('查询节点交付内容列表, 节点ID:', nodeId);
        try {
            const deliverables = await this.deliverableRepository.find({
                where: { node_id: nodeId },
                order: { created_at: 'ASC' }
            });
            console.log(`找到 ${deliverables.length} 个交付内容`);
            console.log('交付内容列表:', JSON.stringify(deliverables, null, 2));
            console.log('SQL查询条件:', { node_id: nodeId });
            const count = await this.deliverableRepository.count({
                where: { node_id: nodeId }
            });
            console.log(`数据库中节点ID为 ${nodeId} 的交付内容数量:`, count);
            return deliverables;
        }
        catch (error) {
            console.error(`查询节点交付内容列表失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findOne(id) {
        console.log('查询单个交付内容, ID:', id);
        const deliverable = await this.deliverableRepository.findOne({
            where: { id }
        });
        if (!deliverable) {
            throw new common_1.NotFoundException(`交付内容 #${id} 不存在`);
        }
        return deliverable;
    }
    async update(id, updateDeliverableDto) {
        console.log('更新交付内容, ID:', id);
        console.log('更新数据:', updateDeliverableDto);
        const deliverable = await this.findOne(id);
        Object.assign(deliverable, updateDeliverableDto);
        if (deliverable.start_date && deliverable.expected_end_date) {
            deliverable.duration_days = (0, date_fns_1.differenceInDays)(new Date(deliverable.expected_end_date), new Date(deliverable.start_date));
        }
        return this.deliverableRepository.save(deliverable);
    }
    async remove(id) {
        console.log('删除交付内容, ID:', id);
        const deliverable = await this.findOne(id);
        await this.deliverableRepository.remove(deliverable);
    }
};
exports.DeliverableService = DeliverableService;
exports.DeliverableService = DeliverableService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(deliverable_entity_1.Deliverable)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DeliverableService);
//# sourceMappingURL=deliverable.service.js.map