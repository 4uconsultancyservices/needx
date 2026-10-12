'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from './chat-message';
import { ChatSkeleton } from '@/components/shared/loading-skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { useConversationMessages, useSendMessage, useTypingIndicator } from '@/hooks/use-messages';
import { MessageCircle } from 'lucide-react';

export function ChatWindow({ conversationId, currentUserId }: { conversationId: string | undefined; currentUserId: string | undefined }) {
  const { data: messages, isLoading } = useConversationMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const typingUserId = useTypingIndicator(conversationId);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.length]);

  if (!conversationId) {
    return <EmptyState icon={MessageCircle} title="Select a conversation" description="Choose a conversation from the list to start chatting." className="h-full" />;
  }

  const submit = () => {
    if (!text.trim()) return;
    sendMessage.mutate(text.trim());
    setText('');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <ChatSkeleton />
        ) : !messages || messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-faint">No messages yet — say hello!</p>
        ) : (
          <div className="space-y-2.5">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} isOwn={m.senderId === currentUserId} />
            ))}
            {typingUserId && typingUserId !== currentUserId && <p className="text-xs italic text-ink-faint">typing...</p>}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Type a message..."
        />
        <Button size="icon" variant="hope" onClick={submit} aria-label="Send">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
