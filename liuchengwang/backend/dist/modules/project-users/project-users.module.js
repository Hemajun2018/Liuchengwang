"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectUsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const project_users_service_1 = require("./project-users.service");
const project_users_controller_1 = require("./project-users.controller");
const project_user_entity_1 = require("../../database/entities/project-user.entity");
const roles_guard_module_1 = require("../../common/guards/roles-guard.module");
let ProjectUsersModule = class ProjectUsersModule {
};
exports.ProjectUsersModule = ProjectUsersModule;
exports.ProjectUsersModule = ProjectUsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([project_user_entity_1.ProjectUser]),
            roles_guard_module_1.RolesGuardModule,
        ],
        controllers: [project_users_controller_1.ProjectUsersController],
        providers: [project_users_service_1.ProjectUsersService],
        exports: [project_users_service_1.ProjectUsersService],
    })
], ProjectUsersModule);
//# sourceMappingURL=project-users.module.js.map