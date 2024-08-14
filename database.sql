CREATE TABLE user (
  id int PRIMARY KEY AUTO_INCREMENT,
  email varchar(255) NOT NULL,
  password varchar(255)
);

CREATE TABLE visa_category (
  id int PRIMARY KEY AUTO_INCREMENT,
  name varchar(32) NOT NULL,
  english_name varchar(128) NOT NULL,
  korean_name varchar(128) NOT NULL
);

CREATE TABLE visa (
  id int PRIMARY KEY AUTO_INCREMENT,
  description varchar(1024) NOT NULL,
  visa_category_id int,
  FOREIGN KEY (visa_category_id) REFERENCES visa_category(id)
);

CREATE TABLE user_visa (
  id int PRIMARY KEY AUTO_INCREMENT,
  expiration_date DATETIME NOT NULL,
  user_id int,
  FOREIGN KEY (user_id) REFERENCES user(id),
  visa_id int,
  FOREIGN KEY (visa_id) REFERENCES visa(id)
);
