"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const roles_guard_1 = require("./roles.guard");
const project_user_entity_1 = require("../../database/entities/project-user.entity");
let RolesGuardModule = class RolesGuardModule {
};
exports.RolesGuardModule = RolesGuardModule;
exports.RolesGuardModule = RolesGuardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([project_user_entity_1.ProjectUser]),
        ],
        providers: [roles_guard_1.RolesGuard],
        exports: [
            roles_guard_1.RolesGuard,
            typeorm_1.TypeOrmModule
        ],
    })
], RolesGuardModule);
//# sourceMappingURL=roles-guard.module.js.map