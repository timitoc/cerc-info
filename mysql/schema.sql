CREATE TABLE `users` (
	`userId` INT NOT NULL AUTO_INCREMENT,
	`email` varchar(50) NOT NULL UNIQUE,
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
	`privilege` INT NOT NULL DEFAULT '0',
	`active` INT NOT NULL DEFAULT '1'
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

# Dummy Data

INSERT INTO users (email, password, privilege, name) VALUES ("admin@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 2, "Administrator"); # password = "parola"
INSERT INTO users (email, password, privilege, name) VALUES ("teacher@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 1, "Teacher"); # password = "parola"

INSERT INTO users (email, password, privilege, name) VALUES ("student@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 0, "Student"); # password = "parola"
INSERT INTO users (email, password, privilege, name) VALUES ("student9@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 0, "Student"); # password = "parola"
INSERT INTO users (email, password, privilege, name) VALUES ("student10@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 0, "Student"); # password = "parola"
INSERT INTO users (email, password, privilege, name) VALUES ("student11@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 0, "Student"); # password = "parola"
INSERT INTO users (email, password, privilege, name) VALUES ("student12@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 0, "Student"); # password = "parola"

INSERT INTO groups (name, description) VALUES ("Clasa IX", "Grup de pregatire clasa a IX-a");
INSERT INTO groups (name, description) VALUES ("Clasa X", "Grup de pregatire clasa a IX-a");
INSERT INTO groups (name, description) VALUES ("Clasele XI-XII", "Grup de pregatire clasele a XI-a si a XII-a");

# Add the teacher to all groups
INSERT INTO group_user (userId, groupId, privilege) VALUES (2, 1, 1);
INSERT INTO group_user (userId, groupId, privilege) VALUES (2, 2, 1);
INSERT INTO group_user (userId, groupId, privilege) VALUES (2, 3, 1);

# Add students

INSERT INTO group_user (userId, groupId, privilege) VALUES (3, 1, 0);
INSERT INTO group_user (userId, groupId, privilege) VALUES (4, 1, 0);

INSERT INTO group_user (userId, groupId, privilege) VALUES (5, 2, 0);

INSERT INTO group_user (userId, groupId, privilege) VALUES (6, 2, 0);
INSERT INTO group_user (userId, groupId, privilege) VALUES (7, 2, 0);

# Add lessons

INSERT INTO lessons(groupId, name, content, authorId, tags, dateAdded) VALUES (1, "Deque", "Lectie despre deque", 2, "structuri de date,stiva,coada,deque");
INSERT INTO lessons(groupId, name, content, authorId, tags, dateAdded) VALUES (1, "Invers modular", "Continut", 2, "matematica,aritmetica modulara");
