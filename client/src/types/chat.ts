export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  model: string;
  status: number;
  create_time: string;
  update_time: string;
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  token_count: number;
  create_time: string;
}

export interface SessionData {
  session: ChatSession;
  messages: ChatMessage[];
  remaining: number;
  limit: number;
  reset_hours: number;
}
