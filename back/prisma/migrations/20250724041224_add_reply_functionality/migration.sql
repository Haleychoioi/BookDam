-- AlterTable
ALTER TABLE `comments` ADD COLUMN `parent_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `team_comments` ADD COLUMN `parent_id` INTEGER NULL;
