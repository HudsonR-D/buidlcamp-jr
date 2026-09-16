CREATE TABLE sessions (
  id TEXT PRIMARY KEY, token TEXT NOT NULL, user_id INTEGER NOT NULL,
  login TEXT NOT NULL, csrf TEXT NOT NULL, role TEXT NOT NULL, expires INTEGER NOT NULL
);
CREATE INDEX sessions_expiry ON sessions(expires);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE TABLE auth_flows (id TEXT PRIMARY KEY, verifier TEXT NOT NULL, role TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE rate_limits (id TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
