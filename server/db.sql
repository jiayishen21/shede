CREATE DATABASE shede
ENCODING 'UTF8'
LC_COLLATE = 'zh_CN.UTF-8'
LC_CTYPE = 'zh_CN.UTF-8'
TEMPLATE = template0;

CREATE EXTENSION "uuid-ossp";

CREATE TABLE users(
	user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	first_name VARCHAR(100) NOT NULL, 
	last_name VARCHAR(100) NOT NULL,
	email VARCHAR(255) NOT NULL,
	user_password VARCHAR NOT NULL,
	user_type INTEGER DEFAULT 0,
	lang VARCHAR(2) DEFAULT 'En'
);

CREATE TABLE products(
	product_id SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	cn_title VARCHAR(255) NOT NULL,
	subtitle VARCHAR(255),
	cn_subtitle VARCHAR(255),
	price NUMERIC(10, 2) NOT NULL,
	stock INTEGER NOT NULL,
	unit VARCHAR(20) DEFAULT 'Unit',
	cn_unit VARCHAR(20) DEFAULT 'Unit',
	delivery VARCHAR(255) NOT NULL,
	img VARCHAR(255) NOT NULL
);

CREATE TABLE cart(
	id SERIAL PRIMARY KEY,
	user_id uuid,
	product_id INTEGER,
	title VARCHAR(255) NOT NULL,
	cn_title VARCHAR(255) NOT NULL,
	price NUMERIC(10, 2) NOT NULL,
	unit VARCHAR(20) DEFAULT 'Unit',
	cn_unit VARCHAR(20) DEFAULT 'Unit',
	quantity INTEGER,
	CONSTRAINT fk_user
	FOREIGN KEY(user_id)
	REFERENCES users(user_id),
	CONSTRAINT fk_product
	FOREIGN KEY(product_id)
	REFERENCES products(product_id)
);

CREATE TABLE history(
	id SERIAL PRIMARY KEY,
	user_id uuid,
	product_id INTEGER NOT NULL,
	title VARCHAR(255) NOT NULL,
	cn_title VARCHAR(255) NOT NULL,
	price NUMERIC(10, 2) NOT NULL,
	unit VARCHAR(20) DEFAULT 'Unit',
	cn_unit VARCHAR(20) DEFAULT 'Unit',
	quantity INTEGER,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	email VARCHAR(255) NOT NULL,
	streetnumber VARCHAR(255) NOT NULL,
	city VARCHAR(255) NOT NULL,
	purchase_date DATE DEFAULT current_date,
	completion INTEGER DEFAULT 0
);

INSERT INTO products
(title, cn_title, subtitle, cn_subtitle, price, stock, unit, cn_unit, delivery, img)
VALUES ('Nike air max', 'Nike air max (cn)', 'Size 11 men', 'Size 11 men (cn)', 149.99, 11, 'Pair', 'Pair (cn)', 'Richmond Hill, ON', 'nikeairmax.jpg');