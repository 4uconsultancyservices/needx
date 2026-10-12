import { EventEmitter } from 'events';

/**
 * Decouples MessagesService (which persists messages, called from both the
 * REST controller and the Socket.IO gateway) from MessagesGateway (which
 * owns the live socket.io Server and does the actual emitting). Without
 * this, the two would depend on each other circularly. A plain in-process
 * EventEmitter is all a single-instance API needs; for multi-instance
 * horizontal scaling, replace with the Redis adapter for socket.io (REDIS_URL
 * is already provisioned) and this bus would publish to Redis pub/sub instead.
 */
export const realtimeBus = new EventEmitter();
realtimeBus.setMaxListeners(50);

export const REALTIME_EVENTS = {
  MESSAGE_CREATED: 'message.created',
} as const;
