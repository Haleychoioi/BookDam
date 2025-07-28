-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `one_line_intro` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_nickname_key`(`nickname`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `books` (
    `isbn13` VARCHAR(191) NOT NULL,
    `book_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `publisher` VARCHAR(191) NOT NULL,
    `pub_date` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `cover` VARCHAR(191) NULL,
    `category_name` VARCHAR(191) NULL,
    `category_id` INTEGER NULL,
    `customer_review_rank` INTEGER NULL,
    `sales_point` INTEGER NULL,
    `best_rank` INTEGER NULL,
    `mall_type` VARCHAR(191) NULL,
    `stock_status` VARCHAR(191) NULL,
    `adult` BOOLEAN NOT NULL DEFAULT false,
    `fixed_price` BOOLEAN NOT NULL DEFAULT false,
    `sub_title` VARCHAR(191) NULL,
    `original_title` VARCHAR(191) NULL,
    `item_page` INTEGER NULL,
    `last_updated` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `books_book_id_key`(`book_id`),
    PRIMARY KEY (`isbn13`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_communities` (
    `team_id` INTEGER NOT NULL AUTO_INCREMENT,
    `book_isbn13` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `type` ENUM('GENERAL', 'RECRUITING') NOT NULL DEFAULT 'GENERAL',
    `status` ENUM('RECRUITING', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'RECRUITING',
    `host_user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`team_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_community_members` (
    `member_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `team_id` INTEGER NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `team_community_members_team_id_idx`(`team_id`),
    UNIQUE INDEX `team_community_members_user_id_team_id_key`(`user_id`, `team_id`),
    PRIMARY KEY (`member_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_applications` (
    `application_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `team_id` INTEGER NOT NULL,
    `application_message` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `applied_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `community_applications_team_id_status_idx`(`team_id`, `status`),
    UNIQUE INDEX `community_applications_user_id_team_id_key`(`user_id`, `team_id`),
    PRIMARY KEY (`application_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `post_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `team_id` INTEGER NULL,
    `type` ENUM('GENERAL', 'RECRUITING') NOT NULL DEFAULT 'GENERAL',
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `posts_team_id_idx`(`team_id`),
    INDEX `posts_user_id_idx`(`user_id`),
    INDEX `posts_type_idx`(`type`),
    PRIMARY KEY (`post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `comment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `comments_post_id_idx`(`post_id`),
    INDEX `comments_user_id_idx`(`user_id`),
    PRIMARY KEY (`comment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `my_libraries` (
    `library_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `book_isbn13` VARCHAR(191) NOT NULL,
    `my_rating` INTEGER NULL,
    `my_comment` VARCHAR(191) NULL,
    `status` ENUM('WANT_TO_READ', 'READING', 'COMPLETED') NOT NULL,
    `added_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `my_libraries_user_id_idx`(`user_id`),
    UNIQUE INDEX `my_libraries_user_id_book_isbn13_key`(`user_id`, `book_isbn13`),
    PRIMARY KEY (`library_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookmarks` (
    `bookmark_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `book_isbn13` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `bookmarks_user_id_idx`(`user_id`),
    UNIQUE INDEX `bookmarks_user_id_book_isbn13_key`(`user_id`, `book_isbn13`),
    PRIMARY KEY (`bookmark_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book_reviews` (
    `review_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `book_isbn13` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `book_reviews_user_id_idx`(`user_id`),
    INDEX `book_reviews_book_isbn13_idx`(`book_isbn13`),
    UNIQUE INDEX `book_reviews_user_id_book_isbn13_key`(`user_id`, `book_isbn13`),
    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq_items` (
    `faq_id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`faq_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `about_contents` (
    `about_id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`about_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `team_communities` ADD CONSTRAINT `team_communities_host_user_id_fkey` FOREIGN KEY (`host_user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_communities` ADD CONSTRAINT `team_communities_book_isbn13_fkey` FOREIGN KEY (`book_isbn13`) REFERENCES `books`(`isbn13`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_community_members` ADD CONSTRAINT `team_community_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_community_members` ADD CONSTRAINT `team_community_members_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `team_communities`(`team_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_applications` ADD CONSTRAINT `community_applications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_applications` ADD CONSTRAINT `community_applications_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `team_communities`(`team_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `team_communities`(`team_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`post_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `my_libraries` ADD CONSTRAINT `my_libraries_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `my_libraries` ADD CONSTRAINT `my_libraries_book_isbn13_fkey` FOREIGN KEY (`book_isbn13`) REFERENCES `books`(`isbn13`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_book_isbn13_fkey` FOREIGN KEY (`book_isbn13`) REFERENCES `books`(`isbn13`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book_reviews` ADD CONSTRAINT `book_reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book_reviews` ADD CONSTRAINT `book_reviews_book_isbn13_fkey` FOREIGN KEY (`book_isbn13`) REFERENCES `books`(`isbn13`) ON DELETE RESTRICT ON UPDATE CASCADE;
