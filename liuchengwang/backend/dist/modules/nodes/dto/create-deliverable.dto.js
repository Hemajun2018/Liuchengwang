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
exports.CreateDeliverableDto = void 0;
const class_validator_1 = require("class-validator");
const deliverable_entity_1 = require("../../../database/entities/deliverable.entity");
class CreateDeliverableDto {
}
exports.CreateDeliverableDto = CreateDeliverableDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliverableDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDeliverableDto.prototype, "start_date", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDeliverableDto.prototype, "expected_end_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDeliverableDto.prototype, "duration_days", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(deliverable_entity_1.DeliverableStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDeliverableDto.prototype, "status", void 0);
//# sourceMappingURL=create-deliverable.dto.js.map