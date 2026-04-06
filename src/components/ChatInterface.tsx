import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { streamChat } from '@/lib/chat';
import { useToast } from '@/hooks/use-toast';

type Msg = { role: 'user' | 'assistant'; content: string };

interface ChatInterfaceProps {
  type: 'interview' | 'cv' | 'evaluate' | 'tips';
  quickPrompts?: { label: string; message: string }[];
  initialMessages?: Msg[];
  context?: string;
}

const ChatInterface = ({ type, quickPrompts, initialMessages = [], context }: ChatInterfaceProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Msg = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: updatedMessages,
      type,
      language: i18n.language?.split('-')[0] || 'en',
      context,
      onDelta: upsertAssistant,
      onDone: () => setIsLoading(false),
      onError: (errorType) => {
        setIsLoading(false);
        toast({
          title: t(`common.${errorType}`),
          variant: 'destructive',
        });
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && quickPrompts && quickPrompts.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center pt-8">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => send(qp.message)}
                className="px-4 py-2 rounded-full bg-muted text-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
              >
                {qp.label}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-card border border-border rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t(`${type}.placeholder`) || t('common.send')}
            className="min-h-[48px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0 h-12 w-12"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
