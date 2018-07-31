CREATE TABLE `users` (
	`user_id` INT NOT NULL AUTO_INCREMENT,
	`email` varchar(50) NOT NULL,
	`password` varchar(100) NOT NULL,
	`privilege` INT NOT NULL DEFAULT '0',
	`two_factor_secret` varchar(50),
	`name` varchar(50) NOT NULL,
	PRIMARY KEY (`user_id`)
);

CREATE TABLE `groups` (
	`group_id` INT NOT NULL AUTO_INCREMENT,
	`group_name` varchar(50) NOT NULL,
	`group_description` varchar(500) NOT NULL,
	PRIMARY KEY (`group_id`)
);

CREATE TABLE `group_user` (
	`group_id` INT NOT NULL,
	`user_id` INT NOT NULL,
	`role` INT NOT NULL DEFAULT '0'
);

CREATE TABLE `lessons` (
	`lesson_id` INT NOT NULL AUTO_INCREMENT,
	`group_id` INT NOT NULL,
	`lesson_name` varchar(100) NOT NULL,
	`lesson_content` TEXT NOT NULL,
	`author_id` INT NOT NULL,
	`tags` TEXT NOT NULL,
	`date_added` DATE NOT NULL,
	PRIMARY KEY (`lesson_id`)
);

CREATE TABLE `attendance` (
	`attendance_id` INT NOT NULL AUTO_INCREMENT,
	`date` DATE NOT NULL,
	`user_id` INT NOT NULL,
	`group_id` INT NOT NULL,
	PRIMARY KEY (`attendance_id`)
);

CREATE TABLE `homework` (
	`homework_id` INT NOT NULL AUTO_INCREMENT,
	`group_id` INT NOT NULL,
	`homework_title` varchar(50) NOT NULL,
	`homework_content` TEXT NOT NULL,
	`deadline` DATE NOT NULL,
	`date_added` DATE NOT NULL,
	PRIMARY KEY (`homework_id`)
);

CREATE TABLE `homework_submit` (
	`submit_id` INT NOT NULL AUTO_INCREMENT,
	`submit_content` TEXT NOT NULL,
	`homework_id` INT NOT NULL,
	`user_id` INT NOT NULL,
	`date_added` DATE NOT NULL,
	`status` INT NOT NULL,
	PRIMARY KEY (`submit_id`)
);

CREATE TABLE `invitation_codes` (
	`code_id` INT NOT NULL AUTO_INCREMENT,
	`code_value` varchar(200) NOT NULL,
	`group_id` INT NOT NULL,
	`privilege` INT NOT NULL,
	`email` varchar(50) NOT NULL,
	`used` BOOLEAN NOT NULL DEFAULT '0',
	PRIMARY KEY (`code_id`)
);

ALTER TABLE `group_user` ADD CONSTRAINT `group_user_fk0` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`);

ALTER TABLE `group_user` ADD CONSTRAINT `group_user_fk1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `lessons` ADD CONSTRAINT `lessons_fk0` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`);

ALTER TABLE `lessons` ADD CONSTRAINT `lessons_fk1` FOREIGN KEY (`author_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `attendance` ADD CONSTRAINT `attendance_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `attendance` ADD CONSTRAINT `attendance_fk1` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`);

ALTER TABLE `homework` ADD CONSTRAINT `homework_fk0` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`);

ALTER TABLE `homework_submit` ADD CONSTRAINT `homework_submit_fk0` FOREIGN KEY (`homework_id`) REFERENCES `homework`(`homework_id`);

ALTER TABLE `homework_submit` ADD CONSTRAINT `homework_submit_fk1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `invitation_codes` ADD CONSTRAINT `invitation_codes_fk0` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`);


