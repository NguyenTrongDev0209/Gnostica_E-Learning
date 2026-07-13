-- V2__alter_avatar_length.sql
-- Increase the max length of the avatar column in the accounts table to accommodate long OAuth2 profile picture URLs.
ALTER TABLE accounts ALTER COLUMN avatar TYPE VARCHAR(2048);
