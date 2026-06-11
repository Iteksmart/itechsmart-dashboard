CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  metric_key VARCHAR(128) NOT NULL,
  metric_value JSONB NOT NULL,
  source VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(snapshot_date, metric_key)
);

CREATE TABLE IF NOT EXISTS outreach_daily (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL UNIQUE,
  delivered INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  replied INTEGER DEFAULT 0,
  bounced INTEGER DEFAULT 0,
  spam_blocked INTEGER DEFAULT 0,
  contacts_active INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_daily (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL UNIQUE,
  containers_running INTEGER,
  total_receipts INTEGER,
  action_receipts INTEGER,
  autonomy_rate_pct NUMERIC(5,2),
  incidents_resolved INTEGER,
  avg_mttr_minutes NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_log (
  id SERIAL PRIMARY KEY,
  category VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  severity VARCHAR(16) DEFAULT 'info',
  source VARCHAR(64),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON notification_log(read, created_at DESC);
