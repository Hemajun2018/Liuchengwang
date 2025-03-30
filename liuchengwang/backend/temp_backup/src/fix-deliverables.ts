import { createConnection } from 'typeorm';
import { Node } from './database/entities/node.entity';
import { Deliverable } from './database/entities/deliverable.entity';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function fixDeliverables() {
  console.log('开始修复节点和交付内容的关联关系...');
  
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'liuchengwang',
    entities: [Node, Deliverable],
    synchronize: false
  });

  try {
    // 1. 检查外键约束
    const foreignKeyQuery = `
      SELECT * FROM information_schema.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_NAME = 'nodes'
      AND TABLE_NAME = 'deliverables'
      AND CONSTRAINT_SCHEMA = '${process.env.DB_DATABASE || 'liuchengwang'}';
    `;
    
    const foreignKeys = await connection.query(foreignKeyQuery);
    console.log('外键约束信息:', foreignKeys);
    
    // 2. 如果没有外键约束，添加外键约束
    if (foreignKeys.length === 0) {
      console.log('未找到外键约束，添加外键约束...');
      
      // 先删除可能存在的无效约束
      try {
        await connection.query(`
          ALTER TABLE deliverables
          DROP FOREIGN KEY IF EXISTS FK_deliverables_node_id;
        `);
        console.log('删除旧的外键约束成功');
      } catch (error) {
        console.log('删除旧的外键约束失败，可能不存在:', error.message);
      }
      
      // 添加新的外键约束
      try {
        await connection.query(`
          ALTER TABLE deliverables
          ADD CONSTRAINT FK_deliverables_node_id
          FOREIGN KEY (node_id) REFERENCES nodes(id)
          ON DELETE CASCADE;
        `);
        console.log('添加外键约束成功');
      } catch (error) {
        console.error('添加外键约束失败:', error.message);
      }
    }
    
    // 3. 检查Node实体中的deliverables关系是否正确
    console.log('检查Node实体中的deliverables关系...');
    const nodeMetadata = connection.getMetadata(Node);
    const deliverableRelation = nodeMetadata.relations.find(r => r.propertyName === 'deliverables');
    
    if (deliverableRelation) {
      console.log('Node实体中的deliverables关系存在:', {
        propertyName: deliverableRelation.propertyName,
        type: deliverableRelation.type,
        isLazy: deliverableRelation.isLazy,
        relationType: deliverableRelation.relationType
      });
    } else {
      console.log('Node实体中的deliverables关系不存在');
    }
    
    // 4. 检查Deliverable实体中的node关系是否正确
    console.log('检查Deliverable实体中的node关系...');
    const deliverableMetadata = connection.getMetadata(Deliverable);
    const nodeRelation = deliverableMetadata.relations.find(r => r.propertyName === 'node');
    
    if (nodeRelation) {
      console.log('Deliverable实体中的node关系存在:', {
        propertyName: nodeRelation.propertyName,
        type: nodeRelation.type,
        isLazy: nodeRelation.isLazy,
        relationType: nodeRelation.relationType
      });
    } else {
      console.log('Deliverable实体中的node关系不存在');
    }
    
    // 5. 检查数据库中的交付内容记录
    const deliverables = await connection.getRepository(Deliverable).find();
    console.log(`数据库中共有 ${deliverables.length} 个交付内容`);
    
    // 6. 检查节点ID是否有效
    const invalidDeliverables = [];
    for (const deliverable of deliverables) {
      const node = await connection.getRepository(Node).findOne({
        where: { id: deliverable.node_id }
      });
      
      if (!node) {
        console.log(`交付内容 ${deliverable.id} 的节点ID ${deliverable.node_id} 无效`);
        invalidDeliverables.push(deliverable);
      }
    }
    
    console.log(`发现 ${invalidDeliverables.length} 个无效的交付内容记录`);
    
    // 7. 修复无效的交付内容记录
    if (invalidDeliverables.length > 0) {
      console.log('开始修复无效的交付内容记录...');
      
      // 获取有效的节点ID
      const nodes = await connection.getRepository(Node).find();
      if (nodes.length === 0) {
        console.log('没有有效的节点可用于修复');
      } else {
        const validNodeId = nodes[0].id;
        console.log(`使用节点ID ${validNodeId} 修复无效的交付内容记录`);
        
        for (const deliverable of invalidDeliverables) {
          await connection.getRepository(Deliverable).update(
            { id: deliverable.id },
            { node_id: validNodeId }
          );
          console.log(`已修复交付内容 ${deliverable.id}`);
        }
      }
    }
    
    console.log('修复完成');
    
  } catch (error) {
    console.error('修复过程中出错:', error);
  } finally {
    await connection.close();
    console.log('数据库连接已关闭');
  }
}

// 执行修复
fixDeliverables()
  .then(() => console.log('修复脚本执行完毕'))
  .catch(error => console.error('修复脚本执行失败:', error)); 