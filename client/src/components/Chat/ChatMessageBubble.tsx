import type { ChatMessage } from '../../types/chat';

interface Props {
  message: ChatMessage;
}

export default function ChatMessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div
      className="msg-bubble"
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          padding: '10px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
          color: isUser ? '#fff' : 'var(--color-text)',
          fontSize: 14,
          lineHeight: 1.6,
          wordBreak: 'break-word',
          border: isUser ? 'none' : '1px solid var(--color-border-light)',
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
