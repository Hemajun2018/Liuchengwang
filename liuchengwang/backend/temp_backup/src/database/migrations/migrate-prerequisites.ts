import { createConnection } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Prerequisite } from '../entities/prerequisite.entity';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function migratePrerequisites() {
  console.log('开始迁移前置条件数据...');
  
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [Project, Prerequisite],
    synchronize: false
  });

  try {
    // 获取所有项目
    const projects = await connection.getRepository(Project).find();
    console.log(`找到 ${projects.length} 个项目`);

    // 创建前置条件表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS prerequisites (
        id int NOT NULL AUTO_INCREMENT,
        project_id varchar(36) NOT NULL,
        content text NOT NULL,
        start_date date DEFAULT NULL,
        expected_end_date date DEFAULT NULL,
        duration_days int DEFAULT NULL,
        status varchar(20) DEFAULT 'pending',
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        KEY FK_prerequisites_project (project_id),
        CONSTRAINT FK_prerequisites_project FOREIGN KEY (project_id) REFERENCES projects (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('前置条件表创建成功');

    // 迁移数据
    for (const project of projects) {
      if (project.deliverables) {
        console.log(`迁移项目 ${project.id} 的前置条件: ${project.deliverables}`);
        
        // 创建新的前置条件记录
        const prerequisite = new Prerequisite();
        prerequisite.project_id = project.id;
        prerequisite.content = project.deliverables;
        prerequisite.status = 'pending';
        
        await connection.getRepository(Prerequisite).save(prerequisite);
        console.log(`项目 ${project.id} 的前置条件迁移成功`);
      }
    }

    console.log('前置条件数据迁移完成');
  } catch (error) {
    console.error('迁移过程中出错:', error);
  } finally {
    await connection.close();
    console.log('数据库连接已关闭');
  }
}

// 执行迁移
migratePrerequisites()
  .then(() => console.log('迁移脚本执行完毕'))
  .catch(error => console.error('迁移脚本执行失败:', error)); 