/*
  Warnings:

  - You are about to alter the column `status` on the `team_communities` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(3))`.
  - Added the required column `post_author` to the `team_communities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_content` to the `team_communities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_title` to the `team_communities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `books` ADD COLUMN `story` TEXT NULL,
    ADD COLUMN `toc` TEXT NULL;

-- AlterTable
ALTER TABLE `posts` ADD COLUMN `isbn13` VARCHAR(191) NULL,
    ADD COLUMN `recruitment_status` ENUM('RECRUITING', 'CLOSED') NULL;

-- AlterTable
ALTER TABLE `team_communities` ADD COLUMN `post_author` VARCHAR(191) NOT NULL,
    ADD COLUMN `post_content` TEXT NOT NULL,
    ADD COLUMN `post_title` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `profile_image` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `team_chat_messages` (
    `message_id` INTEGER NOT NULL AUTO_INCREMENT,
    `team_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `message_type` ENUM('MESSAGE', 'SYSTEM') NOT NULL DEFAULT 'MESSAGE',
    `content` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `team_chat_messages_team_id_created_at_idx`(`team_id`, `created_at`),
    INDEX `team_chat_messages_user_id_idx`(`user_id`),
    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `posts_recruitment_status_idx` ON `posts`(`recruitment_status`);

-- CreateIndex
CREATE INDEX `posts_isbn13_idx` ON `posts`(`isbn13`);

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_isbn13_fkey` FOREIGN KEY (`isbn13`) REFERENCES `books`(`isbn13`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_chat_messages` ADD CONSTRAINT `team_chat_messages_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `team_communities`(`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_chat_messages` ADD CONSTRAINT `team_chat_messages_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
