import { formatMessageDate } from './dateUtils';

export interface MessageGroup {
  date: string;
  messages: any[];
}

export const groupMessagesByDate = (messages: any[]): MessageGroup[] => {
  if (!messages || messages.length === 0) return [];

  const groups: { [key: string]: any[] } = {};
  
  messages.forEach(message => {
    const dateKey = formatMessageDate(message.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });

  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages
  }));
};

export const shouldShowDateSeparator = (currentMessage: any, previousMessage: any): boolean => {
  if (!previousMessage) return true;
  
  const currentDate = new Date(currentMessage.timestamp).toDateString();
  const previousDate = new Date(previousMessage.timestamp).toDateString();
  
  return currentDate !== previousDate;
};