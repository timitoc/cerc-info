CREATE TABLE `users` (
	`userId` INT NOT NULL AUTO_INCREMENT,
	`email` varchar(50) NOT NULL,
	`password` varchar(100) NOT NULL,
	`privilege` INT NOT NULL DEFAULT '0',
	`twoFactorSecret` varchar(50),
	`name` varchar(50) NOT NULL,
	PRIMARY KEY (`userId`)
);

CREATE TABLE `groups` (
	`groupId` INT NOT NULL AUTO_INCREMENT,
	`name` varchar(50) NOT NULL,
	`description` varchar(500) NOT NULL,
	PRIMARY KEY (`groupId`)
);

CREATE TABLE `group_user` (
	`groupId` INT NOT NULL,
	`userId` INT NOT NULL,
	`role` INT NOT NULL DEFAULT '0'
);

CREATE TABLE `lessons` (
	`lessonId` INT NOT NULL AUTO_INCREMENT,
	`groupId` INT NOT NULL,
	`name` varchar(100) NOT NULL,
	`content` TEXT NOT NULL,
	`authorId` INT NOT NULL,
	`tags` varchar(50) NOT NULL,
	`dateAdded` DATE NOT NULL,
	PRIMARY KEY (`lessonId`)
);

CREATE TABLE `attendance` (
	`attendanceId` INT NOT NULL AUTO_INCREMENT,
	`date` DATE NOT NULL,
	`userId` INT NOT NULL,
	`groupId` INT NOT NULL,
	PRIMARY KEY (`attendanceId`)
);

CREATE TABLE `homework` (
	`homeworkId` INT NOT NULL AUTO_INCREMENT,
	`groupId` INT NOT NULL,
	`title` varchar(50) NOT NULL,
	`content` TEXT NOT NULL,
	`deadline` DATE NOT NULL,
	`dateAdded` DATE NOT NULL,
	PRIMARY KEY (`homeworkId`)
);

CREATE TABLE `homework_submit` (
	`submitId` INT NOT NULL AUTO_INCREMENT,
	`content` TEXT NOT NULL,
	`homeworkId` INT NOT NULL,
	`userId` INT NOT NULL,
	`dateAdded` DATE NOT NULL,
	`status` INT NOT NULL,
	PRIMARY KEY (`submitId`)
);

CREATE TABLE `invitation_codes` (
	`code_id` INT NOT NULL AUTO_INCREMENT,
	`code` varchar(200) NOT NULL,
	`groupId` INT NOT NULL,
	`privilege` INT NOT NULL,
	`email` varchar(50) NOT NULL,
	`used` BOOLEAN NOT NULL DEFAULT '0',
	PRIMARY KEY (`code_id`)
);

ALTER TABLE `group_user` ADD CONSTRAINT `group_user_fk0` FOREIGN KEY (`groupId`) REFERENCES `groups`(`groupId`);

ALTER TABLE `group_user` ADD CONSTRAINT `group_user_fk1` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`);

ALTER TABLE `lessons` ADD CONSTRAINT `lessons_fk0` FOREIGN KEY (`groupId`) REFERENCES `groups`(`groupId`);

ALTER TABLE `lessons` ADD CONSTRAINT `lessons_fk1` FOREIGN KEY (`authorId`) REFERENCES `users`(`userId`);

ALTER TABLE `attendance` ADD CONSTRAINT `attendance_fk0` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`);

ALTER TABLE `attendance` ADD CONSTRAINT `attendance_fk1` FOREIGN KEY (`groupId`) REFERENCES `groups`(`groupId`);

ALTER TABLE `homework` ADD CONSTRAINT `homework_fk0` FOREIGN KEY (`groupId`) REFERENCES `groups`(`groupId`);

ALTER TABLE `homework_submit` ADD CONSTRAINT `homework_submit_fk0` FOREIGN KEY (`homeworkId`) REFERENCES `homework`(`homeworkId`);

ALTER TABLE `homework_submit` ADD CONSTRAINT `homework_submit_fk1` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`);

ALTER TABLE `invitation_codes` ADD CONSTRAINT `invitation_codes_fk0` FOREIGN KEY (`groupId`) REFERENCES `groups`(`groupId`);


