"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./modules/auth/auth.module");
const project_module_1 = require("./modules/projects/project.module");
const node_module_1 = require("./modules/nodes/node.module");
const prerequisite_module_1 = require("./modules/prerequisites/prerequisite.module");
const deliverable_module_1 = require("./modules/deliverables/deliverable.module");
const user_entity_1 = require("./modules/users/entities/user.entity");
const project_entity_1 = require("./database/entities/project.entity");
const node_entity_1 = require("./database/entities/node.entity");
const issue_entity_1 = require("./database/entities/issue.entity");
const material_entity_1 = require("./database/entities/material.entity");
const prerequisite_entity_1 = require("./database/entities/prerequisite.entity");
const deliverable_entity_1 = require("./database/entities/deliverable.entity");
const project_user_entity_1 = require("./database/entities/project-user.entity");
const project_users_module_1 = require("./modules/project-users/project-users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'mysql',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 3306),
                    username: configService.get('DB_USERNAME', 'root'),
                    password: configService.get('DB_PASSWORD', 'root'),
                    database: configService.get('DB_DATABASE', 'liuchengwang'),
                    entities: [user_entity_1.User, project_entity_1.Project, node_entity_1.Node, issue_entity_1.Issue, material_entity_1.Material, prerequisite_entity_1.Prerequisite, deliverable_entity_1.Deliverable, project_user_entity_1.ProjectUser],
                    synchronize: false,
                }),
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            project_module_1.ProjectModule,
            node_module_1.NodeModule,
            prerequisite_module_1.PrerequisiteModule,
            deliverable_module_1.DeliverableModule,
            project_users_module_1.ProjectUsersModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map