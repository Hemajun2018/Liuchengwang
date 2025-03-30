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

 Date: 30/03/2025 12:57:35
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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of deliverables
-- ----------------------------
BEGIN;
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of issues
-- ----------------------------
BEGIN;
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of materials
-- ----------------------------
BEGIN;
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
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of nodes
-- ----------------------------
BEGIN;
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (54, '11', 1, 0, 0, '2657ef0d-67f6-4008-8783-0bcaf06b040e', '2025-03-30 07:47:05.259356', '2025-03-30 07:47:05.259356');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (55, '2222', 1, 0, 0, 'bb8e02a4-a23d-4043-b749-c09daf4f7522', '2025-03-30 11:47:21.424963', '2025-03-30 11:47:21.424963');
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of prerequisites
-- ----------------------------
BEGIN;
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (27, '11', '2025-03-05', '2025-03-15', 10, '2025-03-30 07:46:39.809014', '2025-03-30 07:46:39.809014', '2657ef0d-67f6-4008-8783-0bcaf06b040e', 'pending');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (28, '1111', NULL, NULL, NULL, '2025-03-30 11:43:38.609376', '2025-03-30 11:43:38.609376', 'bb8e02a4-a23d-4043-b749-c09daf4f7522', 'pending');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (29, '1112222', NULL, NULL, NULL, '2025-03-30 11:43:44.579983', '2025-03-30 11:43:44.579983', 'bb8e02a4-a23d-4043-b749-c09daf4f7522', 'pending');
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
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of project_users
-- ----------------------------
BEGIN;
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
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('2657ef0d-67f6-4008-8783-0bcaf06b040e', '$2b$10$/oZ9etIToGcT5GGY0ko2y.5UknbVa8XuAWijTQ9.PoAn3rTw6PJT.', NULL, 0, 0, 'ceshi', NULL, NULL, '2025-03-30 07:46:28.333867', '2025-03-30 07:46:28.333867', NULL, NULL);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('bb8e02a4-a23d-4043-b749-c09daf4f7522', '$2b$10$8QRaT6rJpxYGQ0FnSgLRLOnZfmNCzxByNo2DmUoNGTgOr.pbtsCmK', NULL, 0, 0, '111', NULL, NULL, '2025-03-30 11:23:08.796854', '2025-03-30 11:23:08.796854', NULL, NULL);
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
INSERT INTO `user` (`id`, `username`, `password`, `role`, `real_name`, `email`, `phone`, `avatar`, `created_at`, `updated_at`) VALUES (22, 'lisi', '$2b$10$EXtnq3YCadxbjnZ4txeG2Om5o5jCUEmtTUDy2jeC2upU/cIemenBW', 'employee', '李四', NULL, NULL, NULL, '2025-03-30 11:39:00.548331', '2025-03-30 11:39:00.548331');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
