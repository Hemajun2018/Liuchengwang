-- 创建前置条件表
CREATE TABLE IF NOT EXISTS `prerequisites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `start_date` date DEFAULT NULL,
  `expected_end_date` date DEFAULT NULL,
  `duration_days` int DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_prerequisites_project` (`project_id`),
  CONSTRAINT `FK_prerequisites_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 修改项目表,移除不需要的字段
ALTER TABLE `projects`
  DROP COLUMN `start_time`,
  DROP COLUMN `end_time`,
  DROP COLUMN `days_needed`; 