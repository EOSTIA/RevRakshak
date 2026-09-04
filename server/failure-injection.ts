import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { sqliteStore } from './services/sqliteStore.js';
import { redisStore } from './services/redisStore.js';

try {
	const suffix = crypto.randomUUID();
	const key = `failure-test:${suffix}`;

	const first = await sqliteStore.reserve(key, 'TEST', 'first worker');
	assert.equal(first.duplicate, false);
	const duplicate = await sqliteStore.reserve(key, 'TEST', 'second worker');
	assert.equal(duplicate.duplicate, true);

	const staleKey = `failure-test:stale:${suffix}`;
	await sqliteStore.reserve(staleKey, 'TEST', 'expired worker', 0);
	const stale = await sqliteStore.reserve(staleKey, 'TEST', 'replacement worker');
	assert.equal(stale.stale, true);

	assert.equal(await redisStore.setIfNotExists(`recovery:lock:${suffix}`, 'worker-a', 30), true);
	assert.equal(await redisStore.setIfNotExists(`recovery:lock:${suffix}`, 'worker-b', 30), false);

	const executorKey = `executor-test:${suffix}`;
	assert.equal((await sqliteStore.reserveExecutor(executorKey)).duplicate, false);
	assert.equal((await sqliteStore.reserveExecutor(executorKey)).duplicate, true);

	console.log(JSON.stringify({ ok: true, stats: await sqliteStore.getStats() }, null, 2));
} finally {
	await sqliteStore.close();
}