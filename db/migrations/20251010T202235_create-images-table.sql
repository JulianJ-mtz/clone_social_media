-- Migration: create-images-table
-- Created: 2025-10-10T20:22:35.272Z
-- UP
-- Write here the changes to apply
CREATE TABLE IF NOT EXISTS images (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_images_user_id ON images (user_id);

CREATE INDEX IF NOT EXISTS idx_images_url ON images (url);

-- DOWN
-- Write here how to revert the changes
DROP TABLE IF EXISTS images;