-- Active: 1759865240083@@127.0.0.1@5432@clone-social-media
CREATE TABLE
    users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

INSERT INTO
    users (name, email, password_hash)
VALUES
    ('Jane Doe', 'jane@example.com', 'hash123'),
    ('John Smith', 'john@example.com', 'hash456');

SELECT FROM users;