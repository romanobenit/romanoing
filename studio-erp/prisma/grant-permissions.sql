-- Grant permissions to studio_user for Studio ERP database
-- Run this script as postgres superuser or database owner

-- Connect to the database first:
-- \c studio_erp

-- Grant USAGE on schema
GRANT USAGE ON SCHEMA public TO studio_user;

-- Grant permissions on all existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO studio_user;

-- Grant permissions on all sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO studio_user;

-- Grant permissions on future tables (so we don't have to run this again)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO studio_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO studio_user;

-- Specific permissions for critical tables
GRANT SELECT ON ruoli TO studio_user;
GRANT SELECT, INSERT, UPDATE ON utenti TO studio_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON accounts TO studio_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO studio_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON verification_tokens TO studio_user;
GRANT SELECT ON clienti TO studio_user;
GRANT SELECT ON incarichi TO studio_user;
GRANT SELECT ON milestone TO studio_user;
GRANT SELECT ON documenti TO studio_user;
GRANT SELECT ON bundle TO studio_user;
GRANT SELECT ON messaggi TO studio_user;

-- Verify permissions
\dp utenti
\dp ruoli
\dp clienti
\dp incarichi
