import dotenv from 'dotenv';
import { kafkaBus } from '../services/kafkaBus.js';

dotenv.config();

const topic = process.env.WORKER_TOPIC || 'recovery.action.completed';
const group = process.env.WORKER_GROUP || 'recovery-audit-worker';
const intervalMs = Number(process.env.WORKER_POLL_MS || 2000);

async function handleEvent(event: { id: string; payload: Record<string, unknown> }) {
  console.log(JSON.stringify({ worker: group, eventId: event.id, status: 'processed', payload: event.payload }));
}

async function tick() {
  if (process.env.KAFKA_BROKERS) {
    await kafkaBus.publishPendingOutbox();
    await kafkaBus.consumeWithGroup(topic, group, async (event) => {
      try {
        await handleEvent(event);
      } catch (error) {
        const attempt = Number(event.payload.attempt || 0) + 1;
        const target = attempt >= 3 ? `${topic}.dead-letter` : `${topic}.retry`;
        await kafkaBus.publishToKafka(target, { originalEventId: event.id, attempt, error: String(error), payload: event.payload });
      }
    });
  } else {
    const partitions = Number(process.env.KAFKA_PARTITIONS || 3);
    for (let partition = 0; partition < partitions; partition += 1) {
      await kafkaBus.consumeLocalWithRecovery(topic, group, async (event) => handleEvent(event), partition);
    }
  }
}

console.log(`[RevRakshak worker] ${group} listening on ${topic}`);
setInterval(() => void tick().catch((error) => console.error('[worker] tick failed', error)), intervalMs);
void tick().catch((error) => console.error('[worker] initial tick failed', error));