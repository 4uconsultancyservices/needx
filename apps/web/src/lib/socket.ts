'use client';

import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

/** Lazily creates a single shared Socket.IO connection to the MessagesGateway.
 * Auth rides on the same httpOnly cookie the REST API uses — no token
 * handling needed here (see WsJwtGuard on the API side). */
export function getSocket(): Socket {
  if (socket) return socket;
  let origin = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  if (typeof window !== 'undefined' && origin.includes('localhost') && window.location.hostname !== 'localhost') {
    origin = origin.replace('localhost', window.location.hostname);
  }
  socket = io(`${origin}/ws/messages`, {
    withCredentials: true,
    autoConnect: true,
    transports: ['websocket', 'polling'],
  });
  return socket;
}
