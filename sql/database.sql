DROP TABLE user_visa;
DROP TABLE visa;
DROP TABLE visa_category;
DROP TABLE user;

CREATE TABLE user (
  id int PRIMARY KEY AUTO_INCREMENT,
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  firstname varchar(128),
  lastname varchar(128),
  status varchar(28),
  verification_token varchar(255),
  verification_expiration datetime,
);

CREATE TABLE visa_category (
  id int PRIMARY KEY AUTO_INCREMENT,
  category varchar(32) NOT NULL,
  english_name varchar(128) NOT NULL,
  korean_name varchar(128) NOT NULL
);

CREATE TABLE visa (
  id int PRIMARY KEY AUTO_INCREMENT,
  subcategory varchar(32),
  description varchar(1024),
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
