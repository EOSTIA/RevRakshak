import { Kafka } from 'kafkajs';
import { sqliteStore } from './sqliteStore.js';
import { createDomainEvent } from './eventContract.js';

export type KafkaEvent = {
  id: string;
  topic: string;
  offset: number;
  timestamp: string;
  payload: Record<string, any>;
  version?: number;
  partition?: number;
};

export class InMemoryKafkaBus {
  private topics: Record<string, KafkaEvent[]> = {};
  private offset = 0;

  async publish(topic: string, payload: Record<string, any>): Promise<KafkaEvent> {
    const event: KafkaEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      topic,
      offset: this.offset++,
      timestamp: new Date().toISOString(),
      payload,
      version: 1
    };

    this.topics[topic] = this.topics[topic] || [];
    this.topics[topic].push(event);
    const durableEvent = await createDomainEvent(topic, String(payload.caseId || payload.paymentId || event.id), payload, 1);
    event.offset = durableEvent.offset || 0;
    event.partition = durableEvent.partition;
    await sqliteStore.addOutbox(topic, event.id, event.payload);
    return event;
  }

  consume(topic: string, limit = 20): KafkaEvent[] {
    const events = this.topics[topic] || [];
    return events.slice(-limit);
  }

  getTopics(): string[] {
    return Object.keys(this.topics);
  }

  getTrafficSnapshot(): Array<{ topic: string; count: number; latest: string }> {
    return Object.entries(this.topics).map(([topic, events]) => ({
      topic,
      count: events.length,
      latest: events[events.length - 1]?.timestamp || new Date().toISOString()
    }));
  }

  async publishToKafka(topic: string, payload: Record<string, any>): Promise<KafkaEvent> {
    const event = await this.publish(topic, payload);
    if (process.env.KAFKA_BROKERS) {
      await this.publishPendingOutbox();
    }
    return event;
  }

  async publishPendingOutbox(limit = 100) {
    const pending = await sqliteStore.getPendingOutbox(limit);
    for (const record of pending) {
      if (process.env.KAFKA_BROKERS) {
        const client = new Kafka({ clientId: 'revrakshak-outbox', brokers: process.env.KAFKA_BROKERS.split(',') });
        const producer = client.producer();
        await producer.connect();
        await producer.send({ topic: record.topic, messages: [{ key: record.aggregateId, value: JSON.stringify(record.payload) }] });
        await producer.disconnect();
      }
      await sqliteStore.markOutboxPublished(record.id);
    }
    return { published: pending.length };
  }

  async consumeWithGroup(topic: string, groupId: string, handler: (event: KafkaEvent) => Promise<void>) {
    if (!process.env.KAFKA_BROKERS) {
      for (const event of this.consume(topic)) await handler(event);
      return;
    }
    const client = new Kafka({ clientId: 'revrakshak-consumer', brokers: process.env.KAFKA_BROKERS.split(',') });
    const consumer = client.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });
    await consumer.run({ eachMessage: async ({ message }) => {
      if (message.value) await handler(JSON.parse(message.value.toString()) as KafkaEvent);
    }});
  }

  async consumeLocalWithRecovery(topic: string, groupId: string, handler: (event: KafkaEvent) => Promise<void>, partition = 0, limit = 50) {
    const events = await sqliteStore.readEvents(topic, groupId, partition, limit);
    for (const event of events) {
      try {
        await handler(event);
        await sqliteStore.commitOffset(groupId, topic, partition, event.offset + 1);
      } catch (error) {
        const attempt = Number(event.payload.attempt || 0) + 1;
        const retryTopic = attempt >= 3 ? `${topic}.dead-letter` : `${topic}.retry`;
        await this.publish(retryTopic, { originalEventId: event.id, error: String(error), attempt, payload: event.payload });
        await sqliteStore.commitOffset(groupId, topic, partition, event.offset + 1);
      }
    }
  }
}

export const kafkaBus = new InMemoryKafkaBus();

export async function seedKafkaDemoEvents() {
  const topics = [
    'payment.failed',
    'recovery.action',
    'recovery.policy',
    'recovery.verified',
    'compliance.blocked'
  ];

  topics.forEach((topic, index) => {
    void kafkaBus.publish(topic, {
      source: 'demo-seed',
      index,
      message: `Seed event for ${topic}`,
      severity: index % 2 === 0 ? 'info' : 'warning'
    });
  });
}
