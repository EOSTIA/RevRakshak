USE revrakshak;

CREATE TABLE IF NOT EXISTS event_log (
  event_id VARCHAR(255) PRIMARY KEY,
  topic VARCHAR(255) NOT NULL,
  partition_number INT NOT NULL,
  event_offset BIGINT NOT NULL,
  event_version INT NOT NULL,
  payload_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL,
  UNIQUE KEY uq_event_position (topic, partition_number, event_offset),
  INDEX idx_event_topic_position (topic, partition_number, event_offset)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS consumer_offsets (
  consumer_group VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  partition_number INT NOT NULL,
  next_offset BIGINT NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (consumer_group, topic, partition_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_schemas (
  topic VARCHAR(255) NOT NULL,
  event_version INT NOT NULL,
  schema_json JSON NOT NULL,
  registered_at DATETIME(3) NOT NULL,
  PRIMARY KEY (topic, event_version)
) ENGINE=InnoDB;