-- MariaDB 10.4 ignored ALTER COLUMN … DROP DEFAULT in 20261025180000_sprint5a; redefine the column instead.
ALTER TABLE `Position` MODIFY `updatedAt` DATETIME(3) NOT NULL;
