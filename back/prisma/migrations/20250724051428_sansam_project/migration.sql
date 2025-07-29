-- CreateIndex
CREATE INDEX `comments_parent_id_idx` ON `comments`(`parent_id`);

-- CreateIndex
CREATE INDEX `team_comments_parent_id_idx` ON `team_comments`(`parent_id`);

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `comments`(`comment_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_comments` ADD CONSTRAINT `team_comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `team_comments`(`team_comment_id`) ON DELETE SET NULL ON UPDATE CASCADE;
