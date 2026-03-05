/*
 Navicat Premium Dump SQL

 Source Server         : demomasterapotek
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : sdm_db

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 19/01/2026 06:34:37
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for applicant
-- ----------------------------
DROP TABLE IF EXISTS `applicant`;
CREATE TABLE `applicant`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `category_id` int NOT NULL,
  `birth_date` date NULL DEFAULT NULL,
  `sex` enum('M','F') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` int NULL DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of applicant
-- ----------------------------
INSERT INTO `applicant` VALUES (1, 'Andi Wijaya', 1, '1998-04-12', 'M', '2026-01-12 19:09:57', NULL, 99, '019', '1@1.com');
INSERT INTO `applicant` VALUES (2, 'Andi Prasetyo', 2, '1997-04-12', 'M', '2026-01-13 20:57:57', NULL, 99, NULL, NULL);
INSERT INTO `applicant` VALUES (4, 'Den Gudartama', 3, '1999-03-12', 'M', '2026-01-13 21:59:32', NULL, 99, NULL, NULL);
INSERT INTO `applicant` VALUES (6, 'wwqwq', 3, '1999-01-19', 'M', '2026-01-19 06:32:54', NULL, 1, NULL, NULL);

-- ----------------------------
-- Table structure for document
-- ----------------------------
DROP TABLE IF EXISTS `document`;
CREATE TABLE `document`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `applicant_id` int NOT NULL,
  `type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `created_by` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uniq_applicant_type`(`applicant_id` ASC, `type` ASC) USING BTREE,
  INDEX `applicant_id`(`applicant_id` ASC) USING BTREE,
  CONSTRAINT `document_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicant` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of document
-- ----------------------------
INSERT INTO `document` VALUES (3, 1, 'cv', '/1/cv/6965078f0b6df_3507081703990002_kartuUjianSkb (7).pdf', '2026-01-12 21:39:11', NULL);
INSERT INTO `document` VALUES (4, 1, 'certificate', '/1/certificate/696507e455a27_CV - LAILIN NUR ASIYAH1.pdf', '2026-01-12 21:40:36', NULL);
INSERT INTO `document` VALUES (5, 1, 'photo', '/1/photo/696cea3a8dad8_download (4).jpg', '2026-01-18 21:12:10', NULL);

-- ----------------------------
-- Table structure for member
-- ----------------------------
DROP TABLE IF EXISTS `member`;
CREATE TABLE `member`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of member
-- ----------------------------
INSERT INTO `member` VALUES (1, 'admin', '$2y$10$BCLdiYOCJeHmH.ngSJTBFuThFA2RjmwJaznE1dUOFBXNtFrCjXlfa', '2026-01-12 05:30:53', 'admin');
INSERT INTO `member` VALUES (2, 'user', '$2y$10$1tR55dFlDoxxg56qyc27xegqRx0NCQhR9U4YVWH7ZpSU3ljMZCwU6', '2026-01-12 21:27:56', 'user');

-- ----------------------------
-- Table structure for ref_category
-- ----------------------------
DROP TABLE IF EXISTS `ref_category`;
CREATE TABLE `ref_category`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ref_category
-- ----------------------------
INSERT INTO `ref_category` VALUES (1, 'HOUSE KEEPER', '2026-01-13 20:45:35');
INSERT INTO `ref_category` VALUES (2, 'GARDENER', '2026-01-13 20:45:35');
INSERT INTO `ref_category` VALUES (3, 'CLEANER', '2026-01-13 20:45:35');
INSERT INTO `ref_category` VALUES (4, 'DRIVER', '2026-01-13 20:45:35');
INSERT INTO `ref_category` VALUES (5, 'WAITER', '2026-01-13 20:45:35');

-- ----------------------------
-- Function structure for hash_password
-- ----------------------------
DROP FUNCTION IF EXISTS `hash_password`;
delimiter ;;
CREATE FUNCTION `hash_password`(p_password VARCHAR(255))
 RETURNS varchar(255) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
  DETERMINISTIC
BEGIN
    RETURN p_password;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
