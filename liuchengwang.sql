/*
 Navicat Premium Dump SQL

 Source Server         : liuchengwang
 Source Server Type    : MySQL
 Source Server Version : 90200 (9.2.0)
 Source Host           : localhost:3306
 Source Schema         : liuchengwang

 Target Server Type    : MySQL
 Target Server Version : 90200 (9.2.0)
 File Encoding         : 65001

 Date: 30/03/2025 17:02:00
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for deliverables
-- ----------------------------
DROP TABLE IF EXISTS `deliverables`;
CREATE TABLE `deliverables` (
  `id` int NOT NULL AUTO_INCREMENT,
  `node_id` int NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date DEFAULT NULL,
  `expected_end_date` date DEFAULT NULL,
  `duration_days` int DEFAULT NULL,
  `status` enum('not_started','in_progress','completed','delayed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_started',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_5d7b950eb7c657c0492fb291767` (`node_id`),
  CONSTRAINT `FK_5d7b950eb7c657c0492fb291767` FOREIGN KEY (`node_id`) REFERENCES `nodes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of deliverables
-- ----------------------------
BEGIN;
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (25, 55, '555', '2025-03-11', '2025-03-13', 2, 'in_progress', '2025-03-30 13:13:56.964701', '2025-03-30 13:13:56.964701');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (26, 55, '33345', '2025-03-02', '2025-03-12', 10, 'in_progress', '2025-03-30 13:16:29.168341', '2025-03-30 13:16:29.168341');
COMMIT;

-- ----------------------------
-- Table structure for issues
-- ----------------------------
DROP TABLE IF EXISTS `issues`;
CREATE TABLE `issues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date DEFAULT NULL,
  `expected_end_date` date DEFAULT NULL,
  `duration_days` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `nodeId` int DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_9aa9667f91384659db19513a811` (`nodeId`),
  CONSTRAINT `FK_9aa9667f91384659db19513a811` FOREIGN KEY (`nodeId`) REFERENCES `nodes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of issues
-- ----------------------------
BEGIN;
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (32, '22', '2025-03-03', '2025-03-13', 10, '2025-03-30 13:16:09.149179', '2025-03-30 13:25:51.000000', 55, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (33, '33', '2025-03-04', '2025-03-13', 9, '2025-03-30 13:16:13.497456', '2025-03-30 13:25:58.000000', 55, 'pending');
COMMIT;

-- ----------------------------
-- Table structure for materials
-- ----------------------------
DROP TABLE IF EXISTS `materials`;
CREATE TABLE `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `node_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('document','image','video','audio','other') COLLATE utf8mb4_unicode_ci DEFAULT 'document',
  `fileSize` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `start_date` date DEFAULT NULL,
  `expected_end_date` date DEFAULT NULL,
  `duration_days` int DEFAULT NULL,
  `status` enum('not_started','in_progress','completed','delayed') COLLATE utf8mb4_unicode_ci DEFAULT 'not_started',
  PRIMARY KEY (`id`),
  KEY `FK_9c965e3f85f76bbffd21f87a44a` (`node_id`),
  CONSTRAINT `FK_9c965e3f85f76bbffd21f87a44a` FOREIGN KEY (`node_id`) REFERENCES `nodes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of materials
-- ----------------------------
BEGIN;
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (29, 55, '33', '33', NULL, 'document', NULL, '2025-03-30 13:16:19.049138', '2025-03-30 13:26:09.000000', '2025-03-10', '2025-03-12', 2, 'completed');
COMMIT;

-- ----------------------------
-- Table structure for nodes
-- ----------------------------
DROP TABLE IF EXISTS `nodes`;
CREATE TABLE `nodes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order` int NOT NULL,
  `is_prerequisite` tinyint NOT NULL DEFAULT '0',
  `is_result` tinyint NOT NULL DEFAULT '0',
  `project_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_8c18b753688ef7a684395df856e` (`project_id`),
  CONSTRAINT `FK_8c18b753688ef7a684395df856e` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of nodes
-- ----------------------------
BEGIN;
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (55, '2222', 1, 0, 0, 'bb8e02a4-a23d-4043-b749-c09daf4f7522', '2025-03-30 11:47:21.424963', '2025-03-30 11:47:21.424963');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (56, '44', 2, 0, 0, 'bb8e02a4-a23d-4043-b749-c09daf4f7522', '2025-03-30 13:28:07.869170', '2025-03-30 13:28:07.869170');
COMMIT;

-- ----------------------------
-- Table structure for prerequisites
-- ----------------------------
DROP TABLE IF EXISTS `prerequisites`;
CREATE TABLE `prerequisites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date DEFAULT NULL,
  `expected_end_date` date DEFAULT NULL,
  `duration_days` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `project_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `FK_526fabfb01dd5f59d3b03d83d2c` (`project_id`),
  CONSTRAINT `FK_526fabfb01dd5f59d3b03d83d2c` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of prerequisites
-- ----------------------------
BEGIN;
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (28, '1111', NULL, NULL, NULL, '2025-03-30 11:43:38.609376', '2025-03-30 11:43:38.609376', 'bb8e02a4-a23d-4043-b749-c09daf4f7522', 'pending');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (29, '1112222', NULL, NULL, NULL, '2025-03-30 11:43:44.579983', '2025-03-30 11:43:44.579983', 'bb8e02a4-a23d-4043-b749-c09daf4f7522', 'pending');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (30, '555', '2025-03-03', '2025-03-11', 8, '2025-03-30 12:59:11.594152', '2025-03-30 12:59:11.594152', 'bb8e02a4-a23d-4043-b749-c09daf4f7522', 'in_progress');
COMMIT;

-- ----------------------------
-- Table structure for project_users
-- ----------------------------
DROP TABLE IF EXISTS `project_users`;
CREATE TABLE `project_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `can_edit` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_project_user` (`project_id`,`user_id`),
  KEY `project_user_project_idx` (`project_id`),
  KEY `project_user_user_idx` (`user_id`),
  CONSTRAINT `fk_project_users_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_users_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of project_users
-- ----------------------------
BEGIN;
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (67, 'bdbfda95-8bb5-499b-8d85-e48650da817f', 1, '2025-03-30 14:36:01.776333', '2025-03-30 14:36:01.776333', 1);
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (68, 'bb8e02a4-a23d-4043-b749-c09daf4f7522', 22, '2025-03-30 15:40:40.887790', '2025-03-30 15:40:40.887790', 0);
COMMIT;

-- ----------------------------
-- Table structure for projects
-- ----------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deliverables` text COLLATE utf8mb4_unicode_ci,
  `days_needed` int NOT NULL DEFAULT '0',
  `status` int NOT NULL DEFAULT '0',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` date DEFAULT NULL,
  `end_time` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `results` json DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2187088ab5ef2a918473cb9900` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of projects
-- ----------------------------
BEGIN;
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('bb8e02a4-a23d-4043-b749-c09daf4f7522', '$2b$10$8QRaT6rJpxYGQ0FnSgLRLOnZfmNCzxByNo2DmUoNGTgOr.pbtsCmK', NULL, 0, 0, '111', NULL, NULL, '2025-03-30 11:23:08.796854', '2025-03-30 15:39:32.000000', '[{\"description\": \"1111\"}, {\"description\": \"444\"}]', NULL);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('bdbfda95-8bb5-499b-8d85-e48650da817f', '$2b$10$HhuGnpnkYBWR9tI4VKjJwOWyCpIlNKhWisdROSiy.9P4utjujXxoi', NULL, 0, 0, '555667', NULL, NULL, '2025-03-30 14:36:01.771118', '2025-03-30 14:36:01.771118', NULL, 1);
COMMIT;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('super_admin','project_admin','content_admin','employee') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'employee',
  `real_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of user
-- ----------------------------
BEGIN;
INSERT INTO `user` (`id`, `username`, `password`, `role`, `real_name`, `email`, `phone`, `avatar`, `created_at`, `updated_at`) VALUES (1, 'admin', '$2b$10$HKri4R8s4HjgFn8C2fnL.ecNIjCUegSkQOum7Y9vvA0eJvn8WOzDy', 'super_admin', '管理员', NULL, NULL, NULL, '2025-03-14 20:40:16.193891', '2025-03-21 11:36:18.000000');
INSERT INTO `user` (`id`, `username`, `password`, `role`, `real_name`, `email`, `phone`, `avatar`, `created_at`, `updated_at`) VALUES (21, 'zhangsan', '$2b$10$UpoxiFTB9/AQiCrJvw1c9uyy9sz0AsvL/Kk9doNv7u5dv075JsyoS', 'employee', '张三', NULL, NULL, NULL, '2025-03-30 11:33:00.922945', '2025-03-30 11:33:00.922945');
INSERT INTO `user` (`id`, `username`, `password`, `role`, `real_name`, `email`, `phone`, `avatar`, `created_at`, `updated_at`) VALUES (22, 'lisi', '$2b$10$EXtnq3YCadxbjnZ4txeG2Om5o5jCUEmtTUDy2jeC2upU/cIemenBW', 'project_admin', '李四', NULL, NULL, NULL, '2025-03-30 11:39:00.548331', '2025-03-30 15:41:07.000000');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
