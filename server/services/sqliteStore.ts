import mysql, { Pool, RowDataPacket } from 'mysql2/promise';
import crypto from 'node:crypto';

export interface OutboxRecord {
  id: string;
  topic: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

type ReservationResult = { duplicate: boolean; stale: boolean; state: string; decision: string; reason: string };

const migrations = [{
  version: 1,
  statements: [
    `CREATE TABLE IF NOT EXISTS action_reservations (idempotency_key VARCHAR(255) PRIMARY KEY, state VARCHAR(32) NOT NULL, decision VARCHAR(64) NOT NULL, reason TEXT NOT NULL, created_at DATETIME(3) NOT NULL, updated_at DATETIME(3) NOT NULL, lease_expires_at DATETIME(3) NOT NULL, INDEX idx_action_reservations_state (state)) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS executor_states (idempotency_key VARCHAR(255) PRIMARY KEY, status VARCHAR(32) NOT NULL, message TEXT NOT NULL, provider_reference VARCHAR(255), created_at DATETIME(3) NOT NULL, updated_at DATETIME(3) NOT NULL) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS provider_events (provider_event_id VARCHAR(255) PRIMARY KEY, provider VARCHAR(64) NOT NULL, event_type VARCHAR(128) NOT NULL, payload_json JSON NOT NULL, received_at DATETIME(3) NOT NULL) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS outbox_events (id CHAR(36) PRIMARY KEY, topic VARCHAR(255) NOT NULL, aggregate_id VARCHAR(255) NOT NULL, payload_json JSON NOT NULL, created_at DATETIME(3) NOT NULL, published_at DATETIME(3), INDEX idx_outbox_pending (published_at, created_at)) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS payouts (id VARCHAR(255) PRIMARY KEY, case_id VARCHAR(255) NOT NULL, amount_paise BIGINT NOT NULL, currency CHAR(3) NOT NULL, status VARCHAR(32) NOT NULL, provider_reference VARCHAR(255), created_at DATETIME(3) NOT NULL, updated_at DATETIME(3) NOT NULL) ENGINE=InnoDB`
  ]
}, {
  version: 2,
  statements: [
    `CREATE TABLE IF NOT EXISTS event_log (event_id VARCHAR(255) PRIMARY KEY, topic VARCHAR(255) NOT NULL, partition_number INT NOT NULL, event_offset BIGINT NOT NULL, event_version INT NOT NULL, payload_json JSON NOT NULL, created_at DATETIME(3) NOT NULL, UNIQUE KEY uq_event_position (topic, partition_number, event_offset), INDEX idx_event_topic_position (topic, partition_number, event_offset)) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS consumer_offsets (consumer_group VARCHAR(255) NOT NULL, topic VARCHAR(255) NOT NULL, partition_number INT NOT NULL, next_offset BIGINT NOT NULL, updated_at DATETIME(3) NOT NULL, PRIMARY KEY (consumer_group, topic, partition_number)) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS event_schemas (topic VARCHAR(255) NOT NULL, event_version INT NOT NULL, schema_json JSON NOT NULL, registered_at DATETIME(3) NOT NULL, PRIMARY KEY (topic, event_version)) ENGINE=InnoDB`
  ]
}];

class MySQLStore {
  private pool?: Pool;
  private initialized?: Promise<void>;

  private getPool() {
    if (!this.pool) {
      const url = process.env.MYSQL_URL;
      this.pool = url
        ? mysql.createPool(url)
        : mysql.createPool({
        host: process.env.MYSQL_HOST || '127.0.0.1',
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'revrakshak',
        waitForConnections: true,
        connectionLimit: 10,
        decimalNumbers: true
        });
    }
    return this.pool;
  }

  async ensureReady() {
    if (!this.initialized) {
      this.initialized = (async () => {
        const pool = this.getPool();
        await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (version INT PRIMARY KEY, applied_at DATETIME(3) NOT NULL) ENGINE=InnoDB');
        const [rows] = await pool.query<RowDataPacket[]>('SELECT version FROM schema_migrations ORDER BY version');
        const applied = new Set(rows.map((row) => Number(row.version)));
        for (const migration of migrations) {
          if (applied.has(migration.version)) continue;
          const connection = await pool.getConnection();
          try {
            await connection.beginTransaction();
            for (const statement of migration.statements) await connection.query(statement);
            await connection.query('INSERT INTO schema_migrations (version, applied_at) VALUES (?, NOW(3))', [migration.version]);
            await connection.commit();
          } catch (error) {
            await connection.rollback();
            throw error;
          } finally {
            connection.release();
          }
        }
      })();
    }
    return this.initialized;
  }

  async reserve(idempotencyKey: string, decision = 'PENDING', reason = 'Reserved', leaseSeconds = 30): Promise<ReservationResult> {
    await this.ensureReady();
    const connection = await this.getPool().getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM action_reservations WHERE idempotency_key = ? FOR UPDATE', [idempotencyKey]);
      if (rows[0]) {
        const stale = rows[0].state === 'PENDING' && new Date(rows[0].lease_expires_at).getTime() <= Date.now();
        if (stale) await connection.query('UPDATE action_reservations SET state = ?, updated_at = NOW(3), reason = ? WHERE idempotency_key = ?', ['STALE', 'Lease expired before completion', idempotencyKey]);
        await connection.commit();
        return { duplicate: true, stale, state: stale ? 'STALE' : rows[0].state, decision: rows[0].decision, reason: rows[0].reason };
      }
      await connection.query(`INSERT INTO action_reservations (idempotency_key, state, decision, reason, created_at, updated_at, lease_expires_at) VALUES (?, 'PENDING', ?, ?, NOW(3), NOW(3), DATE_ADD(NOW(3), INTERVAL ? SECOND))`, [idempotencyKey, decision, reason, leaseSeconds]);
      await connection.commit();
      return { duplicate: false, stale: false, state: 'PENDING', decision, reason };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async finalizeReservation(idempotencyKey: string, decision: string, reason: string) {
    await this.ensureReady();
    await this.getPool().query(`UPDATE action_reservations SET state = 'FINAL', decision = ?, reason = ?, updated_at = NOW(3) WHERE idempotency_key = ?`, [decision, reason, idempotencyKey]);
  }

  async reserveExecutor(idempotencyKey: string, message = 'Execution started') {
    await this.ensureReady();
    try {
      await this.getPool().query(`INSERT INTO executor_states (idempotency_key, status, message, created_at, updated_at) VALUES (?, 'PENDING', ?, NOW(3), NOW(3))`, [idempotencyKey, message]);
      return { duplicate: false, state: 'PENDING', message };
    } catch {
      const [rows] = await this.getPool().query<RowDataPacket[]>('SELECT status, message, provider_reference FROM executor_states WHERE idempotency_key = ?', [idempotencyKey]);
      return { duplicate: true, state: rows[0]?.status || 'UNKNOWN', message: rows[0]?.message || 'Cached executor state', providerReference: rows[0]?.provider_reference || '' };
    }
  }

  async finalizeExecutor(idempotencyKey: string, status: string, message: string, providerReference = '') {
    await this.ensureReady();
    await this.getPool().query('UPDATE executor_states SET status = ?, message = ?, provider_reference = ?, updated_at = NOW(3) WHERE idempotency_key = ?', [status, message, providerReference, new Date().toISOString(), idempotencyKey]);
  }

  async recordProviderEvent(providerEventId: string, provider: string, eventType: string, payload: Record<string, unknown>) {
    await this.ensureReady();
    try {
      await this.getPool().query('INSERT INTO provider_events (provider_event_id, provider, event_type, payload_json, received_at) VALUES (?, ?, ?, ?, NOW(3))', [providerEventId, provider, eventType, JSON.stringify(payload)]);
      return { duplicate: false };
    } catch {
      return { duplicate: true };
    }
  }

  async addOutbox(topic: string, aggregateId: string, payload: Record<string, unknown>): Promise<OutboxRecord> {
    await this.ensureReady();
    const record = { id: crypto.randomUUID(), topic, aggregateId, payload, createdAt: new Date().toISOString() };
    await this.getPool().query('INSERT INTO outbox_events (id, topic, aggregate_id, payload_json, created_at) VALUES (?, ?, ?, ?, ?)', [record.id, record.topic, record.aggregateId, JSON.stringify(record.payload), record.createdAt.slice(0, 23).replace('T', ' ')]);
    return record;
  }

  async getPendingOutbox(limit = 100): Promise<OutboxRecord[]> {
    await this.ensureReady();
    const [rows] = await this.getPool().query<RowDataPacket[]>('SELECT id, topic, aggregate_id, payload_json, created_at FROM outbox_events WHERE published_at IS NULL ORDER BY created_at LIMIT ?', [limit]);
    return rows.map((row) => ({ id: row.id, topic: row.topic, aggregateId: row.aggregate_id, payload: typeof row.payload_json === 'string' ? JSON.parse(row.payload_json) : row.payload_json, createdAt: new Date(row.created_at).toISOString() }));
  }

  async markOutboxPublished(id: string) {
    await this.ensureReady();
    await this.getPool().query('UPDATE outbox_events SET published_at = NOW(3) WHERE id = ?', [id]);
  }

  async getStats() {
    await this.ensureReady();
    const [rows] = await this.getPool().query<RowDataPacket[]>(`SELECT (SELECT COUNT(*) FROM action_reservations) reservations, (SELECT COUNT(*) FROM executor_states) executors, (SELECT COUNT(*) FROM provider_events) providerEvents, (SELECT COUNT(*) FROM outbox_events WHERE published_at IS NULL) pendingOutbox`);
    return rows[0];
  }

  async appendEvent(event: { id: string; topic: string; version: number; partition: number; payload: Record<string, unknown> }) {
    await this.ensureReady();
    const connection = await this.getPool().getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query<RowDataPacket[]>('SELECT COALESCE(MAX(event_offset) + 1, 0) AS next_offset FROM event_log WHERE topic = ? AND partition_number = ? FOR UPDATE', [event.topic, event.partition]);
      const offset = Number(rows[0]?.next_offset || 0);
      await connection.query('INSERT INTO event_log (event_id, topic, partition_number, event_offset, event_version, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW(3))', [event.id, event.topic, event.partition, offset, event.version, JSON.stringify(event.payload)]);
      await connection.commit();
      return offset;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async readEvents(topic: string, group: string, partition: number, limit = 50) {
    await this.ensureReady();
    const [offsetRows] = await this.getPool().query<RowDataPacket[]>('SELECT next_offset FROM consumer_offsets WHERE consumer_group = ? AND topic = ? AND partition_number = ?', [group, topic, partition]);
    const nextOffset = Number(offsetRows[0]?.next_offset || 0);
    const [rows] = await this.getPool().query<RowDataPacket[]>('SELECT event_id, topic, partition_number, event_offset, event_version, payload_json, created_at FROM event_log WHERE topic = ? AND partition_number = ? AND event_offset >= ? ORDER BY event_offset LIMIT ?', [topic, partition, nextOffset, limit]);
    return rows.map((row) => ({ id: row.event_id, topic: row.topic, partition: row.partition_number, offset: Number(row.event_offset), version: row.event_version, timestamp: new Date(row.created_at).toISOString(), payload: typeof row.payload_json === 'string' ? JSON.parse(row.payload_json) : row.payload_json }));
  }

  async commitOffset(group: string, topic: string, partition: number, nextOffset: number) {
    await this.ensureReady();
    await this.getPool().query(`INSERT INTO consumer_offsets (consumer_group, topic, partition_number, next_offset, updated_at) VALUES (?, ?, ?, ?, NOW(3)) ON DUPLICATE KEY UPDATE next_offset = VALUES(next_offset), updated_at = NOW(3)`, [group, topic, partition, nextOffset]);
  }

  async registerSchema(topic: string, version: number, schema: Record<string, unknown>) {
    await this.ensureReady();
    await this.getPool().query('INSERT IGNORE INTO event_schemas (topic, event_version, schema_json, registered_at) VALUES (?, ?, ?, NOW(3))', [topic, version, JSON.stringify(schema)]);
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = undefined;
      this.initialized = undefined;
    }
  }
}

// Kept under the old import name to avoid changing the UI-facing store contract.
export const sqliteStore = new MySQLStore();
