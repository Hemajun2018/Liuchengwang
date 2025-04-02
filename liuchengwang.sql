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

 Date: 02/04/2025 08:22:12
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
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of deliverables
-- ----------------------------
BEGIN;
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (25, 58, '555', '2025-03-11', '2025-03-13', 2, 'in_progress', '2025-03-30 13:13:56.964701', '2025-03-31 17:13:53.000000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (26, 58, '33345', '2025-03-02', '2025-03-12', 10, 'in_progress', '2025-03-30 13:16:29.168341', '2025-03-31 17:13:53.000000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (27, 58, 'ggg', '2025-03-04', '2025-03-12', 8, 'in_progress', '2025-03-30 19:27:17.588080', '2025-03-31 17:13:53.000000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (28, 59, '111ggg', '2025-03-11', '2025-03-12', 1, 'in_progress', '2025-03-30 19:29:22.234806', '2025-03-31 17:13:53.000000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (29, 58, 'uuuu', '2025-03-03', '2025-03-21', 18, 'delayed', '2025-03-30 19:41:07.018611', '2025-03-31 17:13:53.000000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (30, 55, 'uuuu', '2025-03-03', '2025-03-21', 18, 'delayed', '2025-03-31 17:13:53.632000', '2025-03-31 17:13:53.632000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (31, 55, 'ggg', '2025-03-04', '2025-03-12', 8, 'in_progress', '2025-03-31 17:13:53.634000', '2025-03-31 17:13:53.634000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (32, 55, '33345', '2025-03-02', '2025-03-12', 10, 'in_progress', '2025-03-31 17:13:53.635000', '2025-03-31 17:13:53.635000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (33, 55, '555', '2025-03-11', '2025-03-13', 2, 'in_progress', '2025-03-31 17:13:53.636000', '2025-03-31 17:13:53.636000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (34, 56, '111ggg', '2025-03-11', '2025-03-12', 1, 'in_progress', '2025-03-31 17:13:53.639000', '2025-03-31 17:13:53.639000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (35, 62, '发送', '2025-03-11', '2025-03-21', 10, 'not_started', '2025-03-31 17:20:35.665364', '2025-03-31 17:20:47.000000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (37, 63, 'q q q q', '2025-03-04', '2025-03-12', 8, 'not_started', '2025-03-31 17:39:12.141999', '2025-03-31 17:39:12.141999');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (38, 64, 'q q q q', NULL, NULL, NULL, 'not_started', '2025-03-31 17:39:42.959000', '2025-03-31 17:39:42.959000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (39, 65, 'f f f', '2025-03-11', '2025-03-12', 1, 'not_started', '2025-03-31 17:45:51.259682', '2025-03-31 17:45:51.259682');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (40, 66, 'f f f', NULL, NULL, NULL, 'not_started', '2025-03-31 17:46:11.602000', '2025-03-31 17:46:11.602000');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (41, 66, '发发发', '2025-03-11', '2025-03-15', 4, 'not_started', '2025-03-31 17:48:57.035575', '2025-03-31 17:48:57.035575');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (42, 65, 'rbvedv', '2025-03-10', '2025-03-13', 3, 'completed', '2025-03-31 22:17:25.549168', '2025-03-31 22:17:25.549168');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (43, 67, '1111', '2025-04-08', '2025-04-23', 15, 'in_progress', '2025-04-01 10:37:19.747209', '2025-04-01 10:37:19.747209');
INSERT INTO `deliverables` (`id`, `node_id`, `description`, `start_date`, `expected_end_date`, `duration_days`, `status`, `created_at`, `updated_at`) VALUES (44, 68, 'eee', '2025-04-07', '2025-04-15', 8, 'not_started', '2025-04-01 20:03:10.548612', '2025-04-01 20:03:10.548612');
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
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of issues
-- ----------------------------
BEGIN;
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (32, '22', '2025-03-03', '2025-03-13', 10, '2025-03-30 13:16:09.149179', '2025-03-31 17:13:53.000000', 58, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (33, '33', '2025-03-04', '2025-03-13', 9, '2025-03-30 13:16:13.497456', '2025-03-31 17:13:53.000000', 58, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (34, 'gggg', '2025-03-02', '2025-03-12', 10, '2025-03-30 19:27:03.304199', '2025-03-31 17:13:53.000000', 58, 'resolved');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (35, 'ddd', '2025-03-02', '2025-03-12', 10, '2025-03-30 19:29:47.669106', '2025-03-31 17:13:53.000000', 60, 'resolved');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (36, 'hhhhj', '2025-03-10', '2025-03-12', 2, '2025-03-30 19:31:07.195618', '2025-03-31 17:13:53.000000', 60, 'resolved');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (37, 'gggg', '2025-03-02', '2025-03-12', 10, '2025-03-31 17:13:53.623000', '2025-03-31 17:13:53.623000', NULL, 'resolved');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (38, '33', '2025-03-04', '2025-03-13', 9, '2025-03-31 17:13:53.625000', '2025-03-31 17:13:53.625000', NULL, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (39, '22', '2025-03-03', '2025-03-13', 10, '2025-03-31 17:13:53.626000', '2025-03-31 17:13:53.626000', NULL, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (40, 'hhhhj', '2025-03-10', '2025-03-12', 2, '2025-03-31 17:13:53.642000', '2025-03-31 17:13:53.642000', NULL, 'resolved');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (41, 'ddd', '2025-03-02', '2025-03-12', 10, '2025-03-31 17:13:53.643000', '2025-03-31 17:13:53.643000', NULL, 'resolved');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (42, '更改', NULL, NULL, NULL, '2025-03-31 17:20:24.247619', '2025-03-31 17:20:47.000000', 62, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (43, '更改', NULL, NULL, NULL, '2025-03-31 17:20:47.536000', '2025-03-31 17:20:47.536000', NULL, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (44, 'q q q', NULL, NULL, NULL, '2025-03-31 17:38:56.078338', '2025-03-31 17:38:56.078338', 63, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (45, 'q q q', NULL, NULL, NULL, '2025-03-31 17:39:42.953000', '2025-03-31 17:39:42.953000', 64, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (46, 'f f f', NULL, NULL, NULL, '2025-03-31 17:45:40.590326', '2025-03-31 17:45:40.590326', 65, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (48, '11122', NULL, NULL, NULL, '2025-03-31 17:47:22.112821', '2025-03-31 17:47:22.112821', 66, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (49, '测试问题', '2025-03-04', '2025-03-21', 17, '2025-03-31 17:48:30.140702', '2025-03-31 17:48:30.140702', 66, 'resolved');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (50, '更改', NULL, NULL, NULL, '2025-03-31 17:53:33.827005', '2025-03-31 17:53:33.827005', 66, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (51, 'hhh', '2025-03-03', '2025-03-13', 10, '2025-03-31 17:56:15.452941', '2025-03-31 17:56:15.452941', 66, 'resolved');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (52, '方法', NULL, NULL, NULL, '2025-03-31 18:02:16.810130', '2025-03-31 18:02:16.810130', 66, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (53, '111', '2025-03-05', '2025-03-13', 8, '2025-03-31 18:03:27.203726', '2025-03-31 18:03:27.203726', 66, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (54, '11123的', NULL, NULL, NULL, '2025-03-31 18:07:48.241314', '2025-03-31 18:07:48.241314', 66, 'pending');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (55, 'fadvaw', '2025-03-10', '2025-03-19', 9, '2025-03-31 22:17:10.326179', '2025-03-31 22:17:10.326179', 65, 'resolved');
INSERT INTO `issues` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `nodeId`, `status`) VALUES (56, 'jj', NULL, NULL, NULL, '2025-04-01 10:37:24.878576', '2025-04-01 10:37:24.878576', 67, 'pending');
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
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of materials
-- ----------------------------
BEGIN;
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (29, 58, '33', '33', NULL, 'document', NULL, '2025-03-30 13:16:19.049138', '2025-03-31 17:13:53.000000', '2025-03-10', '2025-03-12', 2, 'completed');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (30, 58, 'ggg', 'ggg', NULL, 'document', NULL, '2025-03-30 19:27:11.127338', '2025-03-31 17:13:53.000000', '2025-03-10', '2025-03-12', 2, 'in_progress');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (31, 60, 'ddd', 'ddd', NULL, 'document', NULL, '2025-03-30 19:29:54.246446', '2025-03-31 17:13:53.000000', NULL, NULL, 1, 'not_started');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (32, 58, 'ggg', 'ggg', NULL, 'document', NULL, '2025-03-30 19:27:11.127000', '2025-03-30 19:27:11.127000', '2025-03-10', '2025-03-12', 2, 'in_progress');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (33, 58, '33', '33', NULL, 'document', NULL, '2025-03-30 13:16:19.049000', '2025-03-30 13:26:09.000000', '2025-03-10', '2025-03-12', 2, 'completed');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (34, 60, 'ddd', 'ddd', NULL, 'document', NULL, '2025-03-30 19:29:54.246000', '2025-03-30 19:29:54.246000', NULL, NULL, 1, 'not_started');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (35, 62, '滚滚滚', '发发发', NULL, 'document', NULL, '2025-03-31 17:20:29.511835', '2025-03-31 17:20:47.000000', NULL, NULL, 1, 'not_started');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (36, 62, '滚滚滚', '发发发', NULL, 'document', NULL, '2025-03-31 17:20:29.511000', '2025-03-31 17:20:29.511000', NULL, NULL, 1, 'not_started');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (37, 63, 'q q q', 'q q q q', NULL, 'document', NULL, '2025-03-31 17:39:01.798722', '2025-03-31 17:39:01.798722', NULL, NULL, 1, 'not_started');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (38, 64, 'q q q', NULL, NULL, 'document', NULL, '2025-03-31 17:39:42.957000', '2025-03-31 17:39:42.957000', NULL, NULL, NULL, 'not_started');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (39, 65, 'f f f', 'f f f f', NULL, 'document', NULL, '2025-03-31 17:45:44.583936', '2025-03-31 17:45:44.583936', NULL, NULL, 1, 'not_started');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (40, 66, 'f f f', NULL, NULL, 'document', NULL, '2025-03-31 17:46:11.598000', '2025-03-31 17:46:11.598000', NULL, NULL, NULL, 'not_started');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (41, 66, '112334', '3324', NULL, 'document', NULL, '2025-03-31 17:47:35.438300', '2025-03-31 17:47:35.438300', NULL, NULL, 1, 'not_started');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (42, 65, 'fedvge', 'gvrwgve', NULL, 'document', NULL, '2025-03-31 22:17:18.115187', '2025-03-31 22:17:18.115187', '2025-03-10', '2025-03-12', 2, 'in_progress');
INSERT INTO `materials` (`id`, `node_id`, `name`, `description`, `url`, `type`, `fileSize`, `created_at`, `updated_at`, `start_date`, `expected_end_date`, `duration_days`, `status`) VALUES (43, 67, 'jj', 'jjj', NULL, 'document', NULL, '2025-04-01 10:37:28.255916', '2025-04-01 10:37:28.255916', NULL, NULL, 1, 'not_started');
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
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of nodes
-- ----------------------------
BEGIN;
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (55, '2222', 1, 0, 0, 'ad032d6e-5a74-4ca5-8950-8771e37baa25', '2025-03-30 11:47:21.424963', '2025-03-31 17:13:53.000000');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (56, '44', 2, 0, 0, 'ad032d6e-5a74-4ca5-8950-8771e37baa25', '2025-03-30 13:28:07.869170', '2025-03-31 17:13:53.000000');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (57, 'ggg', 3, 0, 0, 'ad032d6e-5a74-4ca5-8950-8771e37baa25', '2025-03-30 19:27:21.660826', '2025-03-31 17:13:53.000000');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (58, '2222', 1, 0, 0, 'ad032d6e-5a74-4ca5-8950-8771e37baa25', '2025-03-30 11:47:21.424000', '2025-03-30 11:47:21.424000');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (59, '44', 2, 0, 0, 'ad032d6e-5a74-4ca5-8950-8771e37baa25', '2025-03-30 13:28:07.869000', '2025-03-30 13:28:07.869000');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (60, 'ggg', 3, 0, 0, 'ad032d6e-5a74-4ca5-8950-8771e37baa25', '2025-03-30 19:27:21.660000', '2025-03-30 19:27:21.660000');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (62, '发发发', 1, 0, 0, 'e24947c5-fa73-4bfc-8551-2f0ad0b381d4', '2025-03-31 17:20:16.324000', '2025-03-31 17:20:16.324000');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (63, 'q q q q', 1, 0, 0, '98b10dcf-534d-457a-9553-2f29a0464629', '2025-03-31 17:38:52.267362', '2025-03-31 17:38:52.267362');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (64, 'q q q q', 1, 0, 0, 'fa14c040-c1e7-41a8-b4a2-d9bbd1b90662', '2025-03-31 17:39:42.949000', '2025-03-31 17:39:42.949000');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (65, 'f f f', 1, 0, 0, '0f520c0a-8c71-48a8-a353-84cfbd99ef20', '2025-03-31 17:45:37.499096', '2025-03-31 17:45:37.499096');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (66, 'f f f', 1, 0, 0, '181db7c8-5bc7-48e6-8a5c-c1061e247bdd', '2025-03-31 17:46:11.591000', '2025-03-31 17:46:11.591000');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (67, '个人化让 ', 2, 0, 0, '0f520c0a-8c71-48a8-a353-84cfbd99ef20', '2025-03-31 22:18:57.776121', '2025-03-31 22:18:57.776121');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (68, '222', 1, 0, 0, '4e7f26be-5176-489e-816b-eab42fc3eaf1', '2025-04-01 11:06:07.750909', '2025-04-01 11:06:07.750909');
INSERT INTO `nodes` (`id`, `name`, `order`, `is_prerequisite`, `is_result`, `project_id`, `created_at`, `updated_at`) VALUES (69, '仍然', 2, 0, 0, '4e7f26be-5176-489e-816b-eab42fc3eaf1', '2025-04-01 18:01:01.621721', '2025-04-01 18:01:01.621721');
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
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of prerequisites
-- ----------------------------
BEGIN;
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (32, '333', NULL, NULL, NULL, '2025-03-31 17:20:13.032556', '2025-03-31 17:20:13.032556', 'b5d28484-3855-466e-b1d8-de1e270dcfea', 'pending');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (33, 'qqqq', '2025-03-03', '2025-03-20', 17, '2025-03-31 17:38:47.536875', '2025-03-31 17:38:47.536875', '98b10dcf-534d-457a-9553-2f29a0464629', 'in_progress');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (34, 'qqqq', '2025-03-03', '2025-03-20', 17, '2025-03-31 17:39:42.966000', '2025-03-31 17:39:42.966000', 'fa14c040-c1e7-41a8-b4a2-d9bbd1b90662', 'in_progress');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (35, 'ffffafa', '2025-03-03', '2025-03-20', 17, '2025-03-31 17:45:34.361265', '2025-03-31 22:16:54.000000', '0f520c0a-8c71-48a8-a353-84cfbd99ef20', 'in_progress');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (36, 'fff', NULL, NULL, NULL, '2025-03-31 17:46:11.609000', '2025-03-31 17:46:11.609000', '181db7c8-5bc7-48e6-8a5c-c1061e247bdd', 'pending');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (37, '测试前置', '2025-03-03', '2025-03-12', 9, '2025-03-31 19:34:44.677691', '2025-03-31 19:34:44.677691', 'c6b78319-061d-4b4f-bafb-240d5e26abde', 'in_progress');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (38, 'fadafa', '2025-03-04', '2025-03-12', 8, '2025-03-31 22:17:01.957570', '2025-03-31 22:17:01.957570', '0f520c0a-8c71-48a8-a353-84cfbd99ef20', 'completed');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (39, 'kkkk', NULL, NULL, NULL, '2025-04-01 10:40:10.811620', '2025-04-01 10:40:10.811620', '0f520c0a-8c71-48a8-a353-84cfbd99ef20', 'pending');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (40, '4325日34', '2025-04-01', '2025-04-24', 23, '2025-04-01 11:04:49.496753', '2025-04-01 11:04:49.496753', '4e7f26be-5176-489e-816b-eab42fc3eaf1', 'in_progress');
INSERT INTO `prerequisites` (`id`, `content`, `start_date`, `expected_end_date`, `duration_days`, `created_at`, `updated_at`, `project_id`, `status`) VALUES (41, '111', '2025-04-15', '2025-04-25', 10, '2025-04-01 18:03:55.700941', '2025-04-01 18:03:55.700941', 'a949ab7e-4750-4eeb-93b8-a77a7db59f5d', 'in_progress');
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
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of project_users
-- ----------------------------
BEGIN;
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (67, 'bdbfda95-8bb5-499b-8d85-e48650da817f', 1, '2025-03-30 14:36:01.776333', '2025-03-30 14:36:01.776333', 1);
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (68, 'bb8e02a4-a23d-4043-b749-c09daf4f7522', 22, '2025-03-30 15:40:40.887790', '2025-03-30 15:40:40.887790', 0);
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (70, '42ef862b-3236-4f25-be28-64a5c43ab84b', 22, '2025-03-31 17:13:48.285401', '2025-03-31 17:27:12.000000', 0);
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (71, 'b5d28484-3855-466e-b1d8-de1e270dcfea', 1, '2025-03-31 17:20:07.223272', '2025-03-31 17:20:07.223272', 1);
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (72, 'ad032d6e-5a74-4ca5-8950-8771e37baa25', 22, '2025-03-31 17:27:12.630400', '2025-03-31 17:27:12.630400', 0);
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (73, '98b10dcf-534d-457a-9553-2f29a0464629', 1, '2025-03-31 17:38:35.834188', '2025-03-31 17:38:35.834188', 1);
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (74, '0f520c0a-8c71-48a8-a353-84cfbd99ef20', 1, '2025-03-31 17:45:25.015424', '2025-03-31 17:45:25.015424', 1);
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (75, 'c6b78319-061d-4b4f-bafb-240d5e26abde', 1, '2025-03-31 19:34:30.404459', '2025-03-31 19:34:30.404459', 1);
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (76, '0f520c0a-8c71-48a8-a353-84cfbd99ef20', 22, '2025-04-01 11:03:30.217720', '2025-04-01 11:03:30.217720', 0);
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (77, '4e7f26be-5176-489e-816b-eab42fc3eaf1', 22, '2025-04-01 11:04:16.684989', '2025-04-01 11:04:16.684989', 1);
INSERT INTO `project_users` (`id`, `project_id`, `user_id`, `created_at`, `updated_at`, `can_edit`) VALUES (78, 'a949ab7e-4750-4eeb-93b8-a77a7db59f5d', 22, '2025-04-01 18:03:18.217402', '2025-04-01 18:03:18.217402', 1);
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
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('0f520c0a-8c71-48a8-a353-84cfbd99ef20', '$2b$10$r8wruiXky9lB0WfdsRtnpOFBOuedX4HnINWjRD35yUTyuhM8ZJPOy', NULL, 0, 0, '测试项目3', NULL, NULL, '2025-03-31 17:45:25.009909', '2025-04-01 10:57:55.000000', '[{\"description\": \"给狗狗吃肉\"}, {\"description\": \"史蒂夫\"}, {\"description\": \"4\"}, {\"description\": \"5\"}, {\"description\": \"6\"}, {\"description\": \"7\"}, {\"description\": \"6他34543\"}]', 1);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('181db7c8-5bc7-48e6-8a5c-c1061e247bdd', '$2b$10$r8wruiXky9lB0WfdsRtnpOFBOuedX4HnINWjRD35yUTyuhM8ZJPOy', NULL, 0, 0, '测试项目3的副本', NULL, NULL, '2025-03-31 17:46:11.584000', '2025-03-31 17:46:11.584000', '[{\"description\": \"f f f f\"}]', 1);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('42ef862b-3236-4f25-be28-64a5c43ab84b', '$2b$10$Ugd8.LtKWvQqDqY1ShDuU.ylDMltHmnJ.eQ1bYAg1DOPamcVyUZaC', NULL, 0, 0, '223', NULL, NULL, '2025-03-31 17:13:48.282760', '2025-03-31 17:13:48.282760', NULL, 22);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('4e7f26be-5176-489e-816b-eab42fc3eaf1', '$2b$10$uSaFzrq/k16/KTYSUfgr0.rb1/RGer5zGrGbLnBZYpdWfzEE7IOm6', NULL, 0, 0, '1111333', NULL, NULL, '2025-04-01 11:04:16.679439', '2025-04-01 11:06:35.000000', NULL, 22);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('98b10dcf-534d-457a-9553-2f29a0464629', '$2b$10$8hTlb4v/5ck0ajcyzNsPueK0d2EvQk4Cdzq9c6DtLxkerkKCjw6yW', NULL, 0, 0, 'qqqq', NULL, NULL, '2025-03-31 17:38:35.829509', '2025-03-31 17:39:18.000000', '[{\"description\": \"qqq\"}]', 1);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('a949ab7e-4750-4eeb-93b8-a77a7db59f5d', '$2b$10$xT9.Q.LvzIX0cfpl9OSKze80Bnof5Cz41lV9iLWizCC6lUNfSFHd.', NULL, 0, 0, '222', NULL, NULL, '2025-04-01 18:03:18.213114', '2025-04-01 18:03:18.213114', NULL, 22);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('ad032d6e-5a74-4ca5-8950-8771e37baa25', '$2b$10$8QRaT6rJpxYGQ0FnSgLRLOnZfmNCzxByNo2DmUoNGTgOr.pbtsCmK', NULL, 0, 0, '111的副本', NULL, NULL, '2025-03-31 17:13:53.596000', '2025-03-31 17:13:53.596000', '[{\"description\": \"1111\"}, {\"description\": \"444\"}, {\"description\": \"ggg\"}, {\"description\": \"uuuuu\"}, {\"description\": \"hhhh\"}, {\"description\": \"京津冀\"}]', NULL);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('b5d28484-3855-466e-b1d8-de1e270dcfea', '$2b$10$TuevPqxxvtD.wxQ9.oNOOuelnmAg7S5AtWg667w543vkhCr/43QRe', NULL, 0, 0, '测试，', NULL, NULL, '2025-03-31 17:20:07.218901', '2025-03-31 17:20:41.000000', '[{\"description\": \"发发发\"}, {\"description\": \"更改\"}]', 1);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('bb8e02a4-a23d-4043-b749-c09daf4f7522', '$2b$10$8QRaT6rJpxYGQ0FnSgLRLOnZfmNCzxByNo2DmUoNGTgOr.pbtsCmK', NULL, 0, 0, '111', NULL, NULL, '2025-03-30 11:23:08.796854', '2025-03-30 19:59:08.000000', '[{\"description\": \"1111\"}, {\"description\": \"444\"}, {\"description\": \"ggg\"}, {\"description\": \"uuuuu\"}, {\"description\": \"hhhh\"}, {\"description\": \"京津冀\"}]', NULL);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('bdbfda95-8bb5-499b-8d85-e48650da817f', '$2b$10$HhuGnpnkYBWR9tI4VKjJwOWyCpIlNKhWisdROSiy.9P4utjujXxoi', NULL, 0, 1, '555667', NULL, NULL, '2025-03-30 14:36:01.771118', '2025-03-31 17:12:36.000000', NULL, 1);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('c6b78319-061d-4b4f-bafb-240d5e26abde', '$2b$10$Ayl64S/J9tAtIS3IusQ7huCQXv1tBPdoIpvwrizPNZ1Fz82glTz86', NULL, 0, 0, '测试项目5', NULL, NULL, '2025-03-31 19:34:30.387401', '2025-03-31 19:34:30.387401', NULL, 1);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('e24947c5-fa73-4bfc-8551-2f0ad0b381d4', '$2b$10$TuevPqxxvtD.wxQ9.oNOOuelnmAg7S5AtWg667w543vkhCr/43QRe', NULL, 0, 0, '测试，的副本', NULL, NULL, '2025-03-31 17:20:47.529000', '2025-03-31 17:20:47.529000', '[{\"description\": \"发发发\"}, {\"description\": \"更改\"}]', 1);
INSERT INTO `projects` (`id`, `password`, `deliverables`, `days_needed`, `status`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`, `results`, `created_by`) VALUES ('fa14c040-c1e7-41a8-b4a2-d9bbd1b90662', '$2b$10$8hTlb4v/5ck0ajcyzNsPueK0d2EvQk4Cdzq9c6DtLxkerkKCjw6yW', NULL, 0, 0, 'qqqq的副本', NULL, NULL, '2025-03-31 17:39:42.939000', '2025-03-31 17:39:42.939000', '[{\"description\": \"qqq\"}]', 1);
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
INSERT INTO `user` (`id`, `username`, `password`, `role`, `real_name`, `email`, `phone`, `avatar`, `created_at`, `updated_at`) VALUES (22, 'lisi', '$2b$10$acthc8AcYdUF/hDnNH0wT.evXbgGfjM8yfo7nKeInUSUVDy1/oOIS', 'project_admin', '李四', NULL, NULL, NULL, '2025-03-30 11:39:00.548331', '2025-03-31 17:46:41.000000');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
