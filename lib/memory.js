const CHAT_KEY = 'medvoice_chat';

export function saveChatToMemory(messages) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-50)));
}

export function loadChatFromMemory() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CHAT_KEY);
  return data ? JSON.parse(data) : [];
}
