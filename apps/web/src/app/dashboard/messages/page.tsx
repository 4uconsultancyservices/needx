'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useConversations, useStartConversation } from '@/hooks/use-messages';
import { useCurrentUser } from '@/hooks/use-auth';
import { ChatList } from '@/components/chat/chat-list';
import { ChatWindow } from '@/components/chat/chat-window';
import type { ConversationContextType } from '@needx/types';

function MessagesInner() {
  const searchParams = useSearchParams();
  const conversationParam = searchParams.get('conversation') ?? undefined;
  const { data: conversations = [] } = useConversations();
  const { data: user } = useCurrentUser();
  const startConversation = useStartConversation();
  const [activeId, setActiveId] = useState<string | undefined>(
    conversationParam && !conversationParam.includes(':') ? conversationParam : undefined,
  );

  // Links elsewhere pass a context hint like "order:<id>" or "offer:<id>"
  // rather than a raw conversation id — resolve it to a real conversation.
  useEffect(() => {
    if (!conversationParam || !conversationParam.includes(':')) return;
    const [type, id] = conversationParam.split(':');
    if (!type || !id) return;
    const contextType = type.toUpperCase() as ConversationContextType;
    startConversation.mutate({ contextType, contextId: id }, { onSuccess: (c) => setActiveId(c.id) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationParam]);

  useEffect(() => {
    if (!activeId && conversations[0]) setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  return (
    <div className="card-surface grid h-[calc(100vh-11rem)] grid-cols-1 overflow-hidden sm:grid-cols-[280px_1fr]">
      <div className="hidden overflow-y-auto border-r border-border sm:block">
        <ChatList conversations={conversations} activeId={activeId} onSelect={setActiveId} currentUserId={user?.id} />
      </div>
      <ChatWindow conversationId={activeId} currentUserId={user?.id} />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesInner />
    </Suspense>
  );
}
