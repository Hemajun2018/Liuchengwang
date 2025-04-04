"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const project_controller_1 = require("./project.controller");
const project_service_1 = require("./project.service");
const project_entity_1 = require("../../database/entities/project.entity");
const node_entity_1 = require("../../database/entities/node.entity");
const issue_entity_1 = require("../../database/entities/issue.entity");
const material_entity_1 = require("../../database/entities/material.entity");
const deliverable_entity_1 = require("../../database/entities/deliverable.entity");
const project_user_entity_1 = require("../../database/entities/project-user.entity");
const roles_guard_module_1 = require("../../common/guards/roles-guard.module");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let ProjectModule = class ProjectModule {
};
exports.ProjectModule = ProjectModule;
exports.ProjectModule = ProjectModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                project_entity_1.Project,
                node_entity_1.Node,
                issue_entity_1.Issue,
                material_entity_1.Material,
                deliverable_entity_1.Deliverable,
                project_user_entity_1.ProjectUser
            ]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET') || 'liuchengwang_secret_key',
                    signOptions: {
                        expiresIn: '7d',
                    },
                }),
            }),
            roles_guard_module_1.RolesGuardModule,
        ],
        controllers: [project_controller_1.ProjectController],
        providers: [project_service_1.ProjectService],
        exports: [project_service_1.ProjectService],
    })
], ProjectModule);
//# sourceMappingURL=project.module.js.map