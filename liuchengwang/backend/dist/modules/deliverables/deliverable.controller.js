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
var DeliverableController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliverableController = void 0;
const common_1 = require("@nestjs/common");
const deliverable_service_1 = require("./deliverable.service");
let DeliverableController = DeliverableController_1 = class DeliverableController {
    constructor(deliverableService) {
        this.deliverableService = deliverableService;
        this.logger = new common_1.Logger(DeliverableController_1.name);
    }
    async create(projectId, nodeId, createDeliverableDto) {
        this.logger.log('=== 开始创建交付内容 ===');
        this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}`);
        this.logger.log(`请求参数: ${JSON.stringify(createDeliverableDto, null, 2)}`);
        try {
            const deliverable = await this.deliverableService.create(projectId, +nodeId, createDeliverableDto);
            this.logger.log(`交付内容创建成功: ${JSON.stringify(deliverable, null, 2)}`);
            this.logger.log('=== 交付内容创建完成 ===\n');
            return deliverable;
        }
        catch (error) {
            this.logger.error(`交付内容创建失败: ${error.message}`);
            this.logger.error(`错误堆栈: ${error.stack}`);
            this.logger.error('=== 交付内容创建异常 ===\n');
            throw error;
        }
    }
    async findAll(projectId, nodeId) {
        this.logger.log('=== 开始获取交付内容列表 ===');
        this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}`);
        try {
            const deliverables = await this.deliverableService.findAll(projectId, +nodeId);
            this.logger.log(`获取到 ${deliverables.length} 个交付内容`);
            this.logger.log('=== 交付内容列表获取完成 ===\n');
            return deliverables;
        }
        catch (error) {
            this.logger.error(`获取交付内容列表失败: ${error.message}`);
            this.logger.error(`错误堆栈: ${error.stack}`);
            this.logger.error('=== 交付内容列表获取异常 ===\n');
            throw error;
        }
    }
    async findOne(projectId, nodeId, id) {
        this.logger.log('=== 开始获取单个交付内容 ===');
        this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 交付内容ID: ${id}`);
        try {
            const deliverable = await this.deliverableService.findOne(projectId, +nodeId, +id);
            this.logger.log(`获取到交付内容: ${JSON.stringify(deliverable, null, 2)}`);
            this.logger.log('=== 交付内容获取完成 ===\n');
            return deliverable;
        }
        catch (error) {
            this.logger.error(`获取交付内容失败: ${error.message}`);
            this.logger.error(`错误堆栈: ${error.stack}`);
            this.logger.error('=== 交付内容获取异常 ===\n');
            throw error;
        }
    }
    async update(projectId, nodeId, id, updateDeliverableDto) {
        this.logger.log('=== 开始更新交付内容 ===');
        this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 交付内容ID: ${id}`);
        this.logger.log(`更新数据: ${JSON.stringify(updateDeliverableDto, null, 2)}`);
        try {
            const deliverable = await this.deliverableService.update(projectId, +nodeId, +id, updateDeliverableDto);
            this.logger.log(`交付内容更新成功: ${JSON.stringify(deliverable, null, 2)}`);
            this.logger.log('=== 交付内容更新完成 ===\n');
            return deliverable;
        }
        catch (error) {
            this.logger.error(`更新交付内容失败: ${error.message}`);
            this.logger.error(`错误堆栈: ${error.stack}`);
            this.logger.error('=== 交付内容更新异常 ===\n');
            throw error;
        }
    }
    async remove(projectId, nodeId, id) {
        this.logger.log('=== 开始删除交付内容 ===');
        this.logger.log(`项目ID: ${projectId}, 节点ID: ${nodeId}, 交付内容ID: ${id}`);
        try {
            await this.deliverableService.remove(projectId, +nodeId, +id);
            this.logger.log('交付内容删除成功');
            this.logger.log('=== 交付内容删除完成 ===\n');
        }
        catch (error) {
            this.logger.error(`删除交付内容失败: ${error.message}`);
            this.logger.error(`错误堆栈: ${error.stack}`);
            this.logger.error('=== 交付内容删除异常 ===\n');
            throw error;
        }
    }
};
exports.DeliverableController = DeliverableController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('nodeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DeliverableController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('nodeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DeliverableController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('nodeId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DeliverableController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('nodeId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], DeliverableController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('nodeId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DeliverableController.prototype, "remove", null);
exports.DeliverableController = DeliverableController = DeliverableController_1 = __decorate([
    (0, common_1.Controller)('projects/:projectId/nodes/:nodeId/deliverables'),
    __metadata("design:paramtypes", [deliverable_service_1.DeliverableService])
], DeliverableController);
//# sourceMappingURL=deliverable.controller.js.map