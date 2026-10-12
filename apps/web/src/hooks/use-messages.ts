'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Message } from '@needx/types';
import type { StartConversationInput } from '@needx/validation';
import { messagesApi } from '../lib/api/messages';
import { getSocket } from '../lib/socket';

export function useConversations() {
  return useQuery({ queryKey: ['conversations'], queryFn: messagesApi.mine, refetchInterval: 30_000 });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartConversationInput) => messagesApi.start(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
}

/** History (paginated REST) + live updates over the socket, merged into one list. */
export function useConversationMessages(conversationId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messagesApi.history(conversationId!),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();
    socket.emit('join_conversation', { conversationId });

    const handler = (message: Message) => {
      if (message.conversationId !== conversationId) return;
      qc.setQueryData<Message[]>(['messages', conversationId], (prev) => {
        if (!prev) return [message];
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    };
    socket.on('message', handler);
    return () => {
      socket.off('message', handler);
    };
  }, [conversationId, qc]);

  return query;
}

export function useSendMessage(conversationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => {
      const socket = getSocket();
      if (socket.connected && conversationId) {
        socket.emit('send_message', { conversationId, text });
        return Promise.resolve();
      }
      return messagesApi.send(conversationId!, text) as unknown as Promise<void>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
}

export function useTypingIndicator(conversationId: string | undefined) {
  const [typingUserId, setTypingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();
    const handler = (payload: { userId: string; conversationId: string }) => {
      if (payload.conversationId !== conversationId) return;
      setTypingUserId(payload.userId);
      const timeout = setTimeout(() => setTypingUserId(null), 3000);
      return () => clearTimeout(timeout);
    };
    socket.on('typing', handler);
    return () => {
      socket.off('typing', handler);
    };
  }, [conversationId]);

  return typingUserId;
}
