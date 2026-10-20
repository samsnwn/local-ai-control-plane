-- Creates the application role and database expected by the Nest API and drizzle-kit.
--
-- POSTGRES_USER / POSTGRES_DB in `.env` only provision the superuser and main database
-- used during initialization. The API and drizzle-kit connect with the credentials
-- documented in `.env.example`:
--   postgresql://local_ai_control_plane:local_development_password@localhost:5432/local_ai_control_plane
--
-- Because the credentials differ when `.env` uses custom POSTGRES_* values, every fresh
-- volume needs this role and database as well. This script is idempotent (a no-op when
-- they already exist) and is executed automatically the first time an empty volume is
-- initialized (mounted at /docker-entrypoint-initdb.d by docker-compose.yml).

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'local_ai_control_plane') THEN
    CREATE ROLE local_ai_control_plane WITH LOGIN SUPERUSER PASSWORD 'local_development_password';
  END IF;
END
$$;

SELECT 'CREATE DATABASE local_ai_control_plane OWNER local_ai_control_plane'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'local_ai_control_plane')
\gexec
