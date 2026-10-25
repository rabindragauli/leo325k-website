-- AlterTable
ALTER TABLE `User` DROP COLUMN `invitedAt`,
    DROP COLUMN `name`,
    DROP COLUMN `title`,
    ADD COLUMN `displayName` VARCHAR(191) NOT NULL,
    ADD COLUMN `username` VARCHAR(32) NOT NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `passwordHash` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `LoginThrottle` (
    `key` VARCHAR(80) NOT NULL,
    `failures` INTEGER NOT NULL DEFAULT 0,
    `lastFailureAt` DATETIME(3) NOT NULL,
    `nextAllowedAt` DATETIME(3) NULL,
    `lockedUntil` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LoginThrottle_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);
