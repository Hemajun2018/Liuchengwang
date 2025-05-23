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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Issue = exports.IssueStatus = void 0;
const typeorm_1 = require("typeorm");
const node_entity_1 = require("./node.entity");
var IssueStatus;
(function (IssueStatus) {
    IssueStatus["PENDING"] = "pending";
    IssueStatus["RESOLVED"] = "resolved";
})(IssueStatus || (exports.IssueStatus = IssueStatus = {}));
let Issue = class Issue {
};
exports.Issue = Issue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Issue.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'node_id' }),
    __metadata("design:type", Number)
], Issue.prototype, "nodeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => node_entity_1.Node, node => node.issues),
    (0, typeorm_1.JoinColumn)({ name: 'node_id' }),
    __metadata("design:type", node_entity_1.Node)
], Issue.prototype, "node", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Issue.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: IssueStatus,
        default: IssueStatus.PENDING
    }),
    __metadata("design:type", String)
], Issue.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Issue.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Issue.prototype, "expectedEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_days', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Issue.prototype, "durationDays", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Issue.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Issue.prototype, "updatedAt", void 0);
exports.Issue = Issue = __decorate([
    (0, typeorm_1.Entity)('issues')
], Issue);
//# sourceMappingURL=issue.entity.js.map