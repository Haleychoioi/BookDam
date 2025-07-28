/*
  Warnings:

  - You are about to drop the column `adult` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `best_rank` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `book_id` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `category_name` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `customer_review_rank` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `fixed_price` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `item_page` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `last_updated` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `mall_type` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `original_title` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `sales_point` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `stock_status` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `sub_title` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `my_comment` on the `my_libraries` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `posts` table. All the data in the column will be lost.
  - The values [RECRUITING] on the enum `posts_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `category` on the `team_communities` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `team_communities` table. All the data in the column will be lost.
  - You are about to drop the column `host_user_id` on the `team_communities` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `team_communities` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `team_communities` table. All the data in the column will be lost.
  - The values [INACTIVE] on the enum `team_communities_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `one_line_intro` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `book_reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bookmarks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `community_applications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team_community_members` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[post_id]` on the table `team_communities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `my_libraries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_id` to the `team_communities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agreement` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `book_reviews` DROP FOREIGN KEY `book_reviews_book_isbn13_fkey`;

-- DropForeignKey
ALTER TABLE `book_reviews` DROP FOREIGN KEY `book_reviews_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `bookmarks` DROP FOREIGN KEY `bookmarks_book_isbn13_fkey`;

-- DropForeignKey
ALTER TABLE `bookmarks` DROP FOREIGN KEY `bookmarks_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `community_applications` DROP FOREIGN KEY `community_applications_team_id_fkey`;

-- DropForeignKey
ALTER TABLE `community_applications` DROP FOREIGN KEY `community_applications_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `my_libraries` DROP FOREIGN KEY `my_libraries_book_isbn13_fkey`;

-- DropForeignKey
ALTER TABLE `my_libraries` DROP FOREIGN KEY `my_libraries_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_team_id_fkey`;

-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `team_communities` DROP FOREIGN KEY `team_communities_host_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `team_community_members` DROP FOREIGN KEY `team_community_members_team_id_fkey`;

-- DropForeignKey
ALTER TABLE `team_community_members` DROP FOREIGN KEY `team_community_members_user_id_fkey`;

-- DropIndex
DROP INDEX `books_book_id_key` ON `books`;

-- DropIndex
DROP INDEX `my_libraries_book_isbn13_fkey` ON `my_libraries`;

-- DropIndex
DROP INDEX `posts_team_id_idx` ON `posts`;

-- DropIndex
DROP INDEX `team_communities_host_user_id_fkey` ON `team_communities`;

-- AlterTable
ALTER TABLE `about_contents` ADD COLUMN `display_order` INTEGER NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `books` DROP COLUMN `adult`,
    DROP COLUMN `best_rank`,
    DROP COLUMN `book_id`,
    DROP COLUMN `category_id`,
    DROP COLUMN `category_name`,
    DROP COLUMN `customer_review_rank`,
    DROP COLUMN `fixed_price`,
    DROP COLUMN `item_page`,
    DROP COLUMN `last_updated`,
    DROP COLUMN `mall_type`,
    DROP COLUMN `original_title`,
    DROP COLUMN `sales_point`,
    DROP COLUMN `stock_status`,
    DROP COLUMN `sub_title`,
    ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `page_count` INTEGER NULL;

-- AlterTable
ALTER TABLE `faq_items` ADD COLUMN `display_order` INTEGER NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `answer` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `my_libraries` DROP COLUMN `my_comment`,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `posts` DROP COLUMN `team_id`,
    ADD COLUMN `max_members` INTEGER NULL,
    MODIFY `type` ENUM('GENERAL', 'RECRUITMENT') NOT NULL DEFAULT 'GENERAL',
    MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `team_communities` DROP COLUMN `category`,
    DROP COLUMN `description`,
    DROP COLUMN `host_user_id`,
    DROP COLUMN `name`,
    DROP COLUMN `type`,
    ADD COLUMN `post_id` INTEGER NOT NULL,
    MODIFY `status` ENUM('RECRUITING', 'ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'RECRUITING';

-- AlterTable
ALTER TABLE `users` DROP COLUMN `one_line_intro`,
    ADD COLUMN `agreement` BOOLEAN NOT NULL,
    ADD COLUMN `introduction` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `book_reviews`;

-- DropTable
DROP TABLE `bookmarks`;

-- DropTable
DROP TABLE `community_applications`;

-- DropTable
DROP TABLE `team_community_members`;

-- CreateTable
CREATE TABLE `team_members` (
    `user_id` INTEGER NOT NULL,
    `team_id` INTEGER NOT NULL,
    `role` ENUM('LEADER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',

    INDEX `team_members_team_id_idx`(`team_id`),
    PRIMARY KEY (`user_id`, `team_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_applications` (
    `application_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,
    `application_message` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `applied_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,

    INDEX `team_applications_post_id_status_idx`(`post_id`, `status`),
    UNIQUE INDEX `team_applications_user_id_post_id_key`(`user_id`, `post_id`),
    PRIMARY KEY (`application_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_posts` (
    `team_post_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `team_id` INTEGER NOT NULL,
    `type` ENUM('NOTICE', 'QUESTION', 'DISCUSSION') NOT NULL DEFAULT 'DISCUSSION',
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `team_posts_team_id_idx`(`team_id`),
    INDEX `team_posts_user_id_idx`(`user_id`),
    INDEX `team_posts_type_idx`(`type`),
    PRIMARY KEY (`team_post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_comments` (
    `team_comment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `team_post_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `team_comments_team_post_id_idx`(`team_post_id`),
    INDEX `team_comments_user_id_idx`(`user_id`),
    PRIMARY KEY (`team_comment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wish_lists` (
    `wish_list_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `book_isbn13` VARCHAR(191) NOT NULL,
    `added_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wish_lists_user_id_idx`(`user_id`),
    UNIQUE INDEX `wish_lists_user_id_book_isbn13_key`(`user_id`, `book_isbn13`),
    PRIMARY KEY (`wish_list_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `about_contents_is_active_display_order_idx` ON `about_contents`(`is_active`, `display_order`);

-- CreateIndex
CREATE INDEX `faq_items_is_active_display_order_idx` ON `faq_items`(`is_active`, `display_order`);

-- CreateIndex
CREATE INDEX `my_libraries_status_idx` ON `my_libraries`(`status`);

-- CreateIndex
CREATE UNIQUE INDEX `team_communities_post_id_key` ON `team_communities`(`post_id`);

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_communities` ADD CONSTRAINT `team_communities_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `team_communities`(`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_applications` ADD CONSTRAINT `team_applications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_applications` ADD CONSTRAINT `team_applications_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_posts` ADD CONSTRAINT `team_posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_posts` ADD CONSTRAINT `team_posts_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `team_communities`(`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_comments` ADD CONSTRAINT `team_comments_team_post_id_fkey` FOREIGN KEY (`team_post_id`) REFERENCES `team_posts`(`team_post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_comments` ADD CONSTRAINT `team_comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `my_libraries` ADD CONSTRAINT `my_libraries_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `my_libraries` ADD CONSTRAINT `my_libraries_book_isbn13_fkey` FOREIGN KEY (`book_isbn13`) REFERENCES `books`(`isbn13`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wish_lists` ADD CONSTRAINT `wish_lists_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wish_lists` ADD CONSTRAINT `wish_lists_book_isbn13_fkey` FOREIGN KEY (`book_isbn13`) REFERENCES `books`(`isbn13`) ON DELETE CASCADE ON UPDATE CASCADE;
