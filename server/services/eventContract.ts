import { z } from 'zod';
import crypto from 'node:crypto';
import { sqliteStore } from './sqliteStore.js';

export const DomainEventSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  version: z.number().int().positive(),
  partition: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative().optional(),
  timestamp: z.string().datetime(),
  payload: z.record(z.string(), z.unknown())
});

export type DomainEvent = z.infer<typeof DomainEventSchema>;

export function partitionFor(key: string, partitionCount = Number(process.env.KAFKA_PARTITIONS || 3)) {
  const digest = crypto.createHash('sha256').update(key).digest();
  return digest.readUInt32BE(0) % Math.max(1, partitionCount);
}

export async function createDomainEvent(topic: string, aggregateId: string, payload: Record<string, unknown>, version = 1): Promise<DomainEvent> {
  const event: DomainEvent = {
    id: crypto.randomUUID(),
    topic,
    version,
    partition: partitionFor(aggregateId),
    timestamp: new Date().toISOString(),
    payload
  };
  DomainEventSchema.parse(event);
  await sqliteStore.registerSchema(topic, version, { type: 'object', version, required: ['id', 'topic', 'version', 'partition', 'timestamp', 'payload'] });
  event.offset = await sqliteStore.appendEvent(event);
  return event;
}