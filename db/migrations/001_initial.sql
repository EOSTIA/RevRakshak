USE revrakshak;

CREATE TABLE IF NOT EXISTS action_reservations (
  idempotency_key VARCHAR(255) PRIMARY KEY,
  state VARCHAR(32) NOT NULL,
  decision VARCHAR(64) NOT NULL,
  reason TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  lease_expires_at DATETIME(3) NOT NULL,
  INDEX idx_action_reservations_state (state)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS executor_states (
  idempotency_key VARCHAR(255) PRIMARY KEY,
  status VARCHAR(32) NOT NULL,
  message TEXT NOT NULL,
  provider_reference VARCHAR(255),
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS provider_events (
  provider_event_id VARCHAR(255) PRIMARY KEY,
  provider VARCHAR(64) NOT NULL,
  event_type VARCHAR(128) NOT NULL,
  payload_json JSON NOT NULL,
  received_at DATETIME(3) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS outbox_events (
  id CHAR(36) PRIMARY KEY,
  topic VARCHAR(255) NOT NULL,
  aggregate_id VARCHAR(255) NOT NULL,
  payload_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL,
  published_at DATETIME(3),
  INDEX idx_outbox_pending (published_at, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payouts (
  id VARCHAR(255) PRIMARY KEY,
  case_id VARCHAR(255) NOT NULL,
  amount_paise BIGINT NOT NULL,
  currency CHAR(3) NOT NULL,
  status VARCHAR(32) NOT NULL,
  provider_reference VARCHAR(255),
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL
) ENGINE=InnoDB;