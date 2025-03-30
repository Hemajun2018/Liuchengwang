-- 首先禁用外键检查
SET FOREIGN_KEY_CHECKS=0;

-- 检查deliverables表结构
DESCRIBE deliverables;

-- 检查外键约束
SELECT * FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME = 'nodes'
AND TABLE_NAME = 'deliverables'
AND CONSTRAINT_SCHEMA = DATABASE();

-- 删除可能存在的无效约束
ALTER TABLE deliverables
DROP FOREIGN KEY IF EXISTS FK_5d7b950eb7c657c0492fb291767;

-- 添加正确的外键约束
ALTER TABLE deliverables
ADD CONSTRAINT FK_deliverables_node_id
FOREIGN KEY (node_id) REFERENCES nodes(id)
ON DELETE CASCADE;

-- 检查是否有无效的节点ID
SELECT d.id, d.node_id, d.description
FROM deliverables d
LEFT JOIN nodes n ON d.node_id = n.id
WHERE n.id IS NULL;

-- 启用外键检查
SET FOREIGN_KEY_CHECKS=1;

-- 查询特定节点的交付内容
SELECT * FROM deliverables WHERE node_id = 37;

-- 查询节点表中的deliverables关系
SELECT n.id, n.name, COUNT(d.id) AS deliverable_count
FROM nodes n
LEFT JOIN deliverables d ON n.id = d.node_id
WHERE n.id = 37
GROUP BY n.id, n.name; 