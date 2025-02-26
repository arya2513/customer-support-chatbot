interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`message ${role}`}>
      <div className={`bubble ${role}`}>
        <p>{content}</p>
      </div>
    </div>
  );
} 