-- Migration: create-tokens-table
-- Created: 2025-10-09T21:01:50.648Z

-- UP
-- Write here the changes to apply
CREATE TABLE IF NOT EXISTS tokens (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    token_type VARCHAR(20) NOT NULL CHECK (token_type IN ('refresh')),
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tokens_user_id ON tokens(user_id);
CREATE INDEX idx_tokens_token_hash ON tokens(token_hash);
CREATE INDEX idx_tokens_expires_at ON tokens(expires_at);

-- DOWN
-- Write here how to revert the changes
DROP TABLE IF EXISTS tokens;