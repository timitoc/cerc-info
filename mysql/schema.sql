CREATE TABLE `users` (
	`user_id` INT NOT NULL AUTO_INCREMENT,
	`privilege` INT NOT NULL,
	`email` varchar(50) NOT NULL,
	`password` varchar(200) NOT NULL,
	`name` varchar(20) NOT NULL,
	`active_group` INT NULL,
	PRIMARY KEY (`user_id`)
);

CREATE TABLE `lessons` (
	`lesson_id` INT NOT NULL AUTO_INCREMENT,
	`title` varchar(50) NOT NULL,
	`author_id` INT NOT NULL,
	PRIMARY KEY (`lesson_id`)
);

CREATE TABLE `groups` (
	`group_id` INT NOT NULL AUTO_INCREMENT,
	`start_date` DATE NOT NULL,
	`end_date` DATE NOT NULL,
	`deleted` BINARY NOT NULL DEFAULT '0',
	`name` varchar(50) NOT NULL,
	`description` varchar(500) NOT NULL,
	PRIMARY KEY (`group_id`)
);

INSERT INTO groups (name, description, start_date, end_date) VALUES
  ("Clasa IX", "Grup de pregatire clasa a IX-a", "2018-01-01", "2019-01-01"),
  ("Clasa X", "Grup de pregatire clasa a X-a", "2018-01-01", "2019-01-01"),
  ("Clasele XI-XII", "Grup de pregatire clasele a XI-a si a XII-a", "2018-01-01", "2019-01-01");

CREATE TABLE `user_group` (
	`user_group_id` INT NOT NULL AUTO_INCREMENT,
	`user_id` INT NOT NULL,
	`group_id` INT NOT NULL,
	PRIMARY KEY (`user_group_id`)
);

INSERT INTO users (email, password, privilege, name, active_group) VALUES
  ("admin@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 2, "Administrator", NULL),
  ("teacher@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 1, "Teacher", 1),
  ("student@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 0, "Student", 1),
  ("student9@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 0, "Student", 1),
  ("student10@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 0, "Student", 1),
  ("student11@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 0, "Student", 1),
  ("student12@cercinfo", "$2a$10$vge1apdqp6d9DxbllKm0VOnpmZJpDKgl4HGB/d7dItZoNCGY7DVsK", 0, "Student", 1);

CREATE TABLE `lesson_comments` (
	`comment_id` INT NOT NULL AUTO_INCREMENT,
	`lesson_id` INT NOT NULL,
	`user_id` INT NOT NULL,
	PRIMARY KEY (`comment_id`)
);

CREATE TABLE `questions` (
	`question_id` INT NOT NULL AUTO_INCREMENT,
	`lesson_id` INT NOT NULL,
	`user_id` INT NOT NULL,
	PRIMARY KEY (`question_id`)
);

CREATE TABLE `answers` (
	`answer_id` INT NOT NULL AUTO_INCREMENT,
	`question_id` INT NOT NULL,
	`user_id` INT NOT NULL,
	PRIMARY KEY (`answer_id`)
);

CREATE TABLE `attendance` (
	`attendance_id` INT NOT NULL AUTO_INCREMENT,
	`group_id` INT NOT NULL,
	`date` DATE NOT NULL,
	PRIMARY KEY (`attendance_id`)
);

CREATE TABLE `attendance_users` (
	`attendance_id` INT NOT NULL,
	`user_id` INT NOT NULL
);

CREATE TABLE `homework` (
	`homework_id` INT NOT NULL AUTO_INCREMENT,
	`group_id` INT NOT NULL,
	`title` varchar(50) NOT NULL,
	`description` varchar(500) NOT NULL,
	`tags` varchar(50) NOT NULL,
	PRIMARY KEY (`homework_id`)
);

CREATE TABLE `tasks` (
	`task_id` INT NOT NULL AUTO_INCREMENT,
	`homework_id` INT NOT NULL,
	`type` INT NOT NULL,
	`content` varchar(500) NOT NULL,
	PRIMARY KEY (`task_id`)
);

CREATE TABLE `submit` (
	`submit_id` INT NOT NULL AUTO_INCREMENT,
	`homework_id` INT NOT NULL,
	`user_id` INT NOT NULL,
	PRIMARY KEY (`submit_id`)
);

CREATE TABLE `submit_task` (
	`submit_id` INT NOT NULL,
	`task_id` INT NOT NULL,
	`content` TEXT NOT NULL
);

CREATE TABLE `invitation_codes` (
	`code_id` INT NOT NULL AUTO_INCREMENT,
	`code` varchar(200) NOT NULL,
	`group_id` INT NOT NULL,
	`privilege` INT NOT NULL,
	`email` varchar(50) NOT NULL,
	`used` BOOLEAN NOT NULL DEFAULT '0',
	PRIMARY KEY (`code_id`)
);

ALTER TABLE `users` ADD CONSTRAINT `users_fk0` FOREIGN KEY (`active_group`) REFERENCES `user_group`(`user_group_id`);

ALTER TABLE `lessons` ADD CONSTRAINT `lessons_fk0` FOREIGN KEY (`author_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `user_group` ADD CONSTRAINT `user_group_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `user_group` ADD CONSTRAINT `user_group_fk1` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`);

ALTER TABLE `lesson_comments` ADD CONSTRAINT `lesson_comments_fk0` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`lesson_id`);

ALTER TABLE `lesson_comments` ADD CONSTRAINT `lesson_comments_fk1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `questions` ADD CONSTRAINT `questions_fk0` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`lesson_id`);

ALTER TABLE `questions` ADD CONSTRAINT `questions_fk1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `answers` ADD CONSTRAINT `answers_fk0` FOREIGN KEY (`question_id`) REFERENCES `questions`(`question_id`);

ALTER TABLE `answers` ADD CONSTRAINT `answers_fk1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `attendance` ADD CONSTRAINT `attendance_fk0` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`);

ALTER TABLE `attendance_users` ADD CONSTRAINT `attendance_users_fk0` FOREIGN KEY (`attendance_id`) REFERENCES `attendance`(`attendance_id`);

ALTER TABLE `attendance_users` ADD CONSTRAINT `attendance_users_fk1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `homework` ADD CONSTRAINT `homework_fk0` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`);

ALTER TABLE `tasks` ADD CONSTRAINT `tasks_fk0` FOREIGN KEY (`homework_id`) REFERENCES `homework`(`homework_id`);

ALTER TABLE `submit` ADD CONSTRAINT `submit_fk0` FOREIGN KEY (`homework_id`) REFERENCES `homework`(`homework_id`);

ALTER TABLE `submit` ADD CONSTRAINT `submit_fk1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `submit_task` ADD CONSTRAINT `submit_task_fk0` FOREIGN KEY (`submit_id`) REFERENCES `submit`(`submit_id`);

ALTER TABLE `submit_task` ADD CONSTRAINT `submit_task_fk1` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`task_id`);

ALTER TABLE `invitation_codes` ADD CONSTRAINT `invitation_codes_fk0` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`);

# Add the teacher to all groups
INSERT INTO group_user (user_id, group_id, privilege) VALUES (2, 1, 1);
INSERT INTO group_user (user_id, group_id, privilege) VALUES (2, 2, 1);
INSERT INTO group_user (user_id, group_id, privilege) VALUES (2, 3, 1);

# Add students

INSERT INTO group_user (user_id, group_id, privilege) VALUES (3, 1, 0);
INSERT INTO group_user (user_id, group_id, privilege) VALUES (4, 1, 0);

INSERT INTO group_user (user_id, group_id, privilege) VALUES (5, 2, 0);

INSERT INTO group_user (user_id, group_id, privilege) VALUES (6, 2, 0);
INSERT INTO group_user (user_id, group_id, privilege) VALUES (7, 2, 0);
