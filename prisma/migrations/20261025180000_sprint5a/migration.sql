-- Sprint 5a: person fields + per-field visibility, unlisted home clubs, position groups + status,
-- forced password change. Hand-written (not `migrate diff`) so renamed columns keep their data.
-- MariaDB 10.4: no RENAME COLUMN, so renames use CHANGE. Charset already utf8mb4 (checked).

-- ───── User ─────
ALTER TABLE `User` ADD COLUMN `mustChangePassword` BOOLEAN NOT NULL DEFAULT false;

-- ───── Person: new fields, visibility switches (NULL = config default) ─────
ALTER TABLE `Person` CHANGE `prefix` `title` VARCHAR(20) NOT NULL,
    ADD COLUMN `photoConsent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `under18` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `landline` VARCHAR(30) NULL,
    ADD COLUMN `bloodGroup` VARCHAR(3) NULL,
    ADD COLUMN `address` VARCHAR(300) NULL,
    ADD COLUMN `designationPublic` BOOLEAN NULL,
    ADD COLUMN `homeClubPublic` BOOLEAN NULL,
    ADD COLUMN `membershipPublic` BOOLEAN NULL,
    ADD COLUMN `landlinePublic` BOOLEAN NULL,
    ADD COLUMN `bloodGroupPublic` BOOLEAN NULL,
    MODIFY `phonePublic` BOOLEAN NULL,
    MODIFY `emailPublic` BOOLEAN NULL;

-- Old rule: public only with the toggle on AND a consent date. Keep "public" only where both held;
-- everyone else is explicitly hidden (false, not NULL), so they stay hidden even if the default
-- later becomes "public".
UPDATE `Person` SET `phonePublic` = false WHERE NOT (`phonePublic` = true AND `consentAt` IS NOT NULL);
UPDATE `Person` SET `emailPublic` = false WHERE NOT (`emailPublic` = true AND `consentAt` IS NOT NULL);

-- ───── Club: listed-in-directory flag, city optional for unlisted clubs ─────
ALTER TABLE `Club` CHANGE `visible` `listedInDirectory` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `city` VARCHAR(191) NULL;

-- Free-text Lions home clubs become unlisted clubs (checked: no person has both fields set).
INSERT INTO `Club` (`id`, `name`, `slug`, `city`, `listedInDirectory`, `createdAt`, `updatedAt`)
SELECT DISTINCT
    CONCAT('club-unlisted-', LOWER(REPLACE(TRIM(p.`homeLionsClub`), ' ', '-'))),
    TRIM(p.`homeLionsClub`),
    CONCAT('unlisted-', LOWER(REPLACE(TRIM(p.`homeLionsClub`), ' ', '-'))),
    NULL,
    false,
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
FROM `Person` p
WHERE p.`homeLionsClub` IS NOT NULL
  AND TRIM(p.`homeLionsClub`) <> ''
  AND NOT EXISTS (SELECT 1 FROM `Club` c WHERE c.`name` = TRIM(p.`homeLionsClub`));

UPDATE `Person` p
JOIN `Club` c ON c.`name` = TRIM(p.`homeLionsClub`)
SET p.`homeClubId` = c.`id`
WHERE p.`homeClubId` IS NULL;

ALTER TABLE `Person` DROP COLUMN `homeLionsClub`,
    DROP COLUMN `consentAt`;

-- ───── Position: groups, draft/published, timestamps ─────
ALTER TABLE `Position` MODIFY `group` ENUM('DISTRICT_LEO', 'DISTRICT_LION', 'CLUB', 'DISTRICT_BOARD', 'DISTRICT_ADVISORS', 'DISTRICT_PRESIDENT_ADVISORS') NOT NULL;
UPDATE `Position` SET `group` = 'DISTRICT_BOARD' WHERE `group` = 'DISTRICT_LEO';
UPDATE `Position` SET `group` = 'DISTRICT_ADVISORS' WHERE `group` = 'DISTRICT_LION';
ALTER TABLE `Position` MODIFY `group` ENUM('DISTRICT_BOARD', 'DISTRICT_ADVISORS', 'DISTRICT_PRESIDENT_ADVISORS', 'CLUB') NOT NULL;

ALTER TABLE `Position` ADD COLUMN `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
-- Positions that existed before drafts were introduced were already public.
UPDATE `Position` SET `status` = 'PUBLISHED';
ALTER TABLE `Position` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- The new index starts with leoYearId, so it takes over the Position_leoYearId_fkey index role
-- before the unique key is dropped (advisors may share a designation).
CREATE INDEX `Position_leoYearId_group_sortOrder_idx` ON `Position`(`leoYearId`, `group`, `sortOrder`);
DROP INDEX `Position_leoYearId_group_role_clubId_key` ON `Position`;
