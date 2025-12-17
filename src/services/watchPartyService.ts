import type { WatchPartyMessage } from '../types/watchParty';

class WatchPartyService {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(roomId: string, userId: string, userName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // В реальном приложении здесь будет настоящий WebSocket сервер
        // Для демо используем имитацию через localStorage и custom events

        this.setupMockWebSocket(roomId, userId, userName);

        setTimeout(() => {
          this.emit('connected', { roomId, userId, userName });
          resolve();
        }, 100);
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupMockWebSocket(roomId: string, userId: string, userName: string) {
    // Эмулируем WebSocket через localStorage и события
    const channel = new BroadcastChannel(`watchparty_${roomId}`);
    console.log(`🎬 [WatchParty] Connected to room: ${roomId} as ${userName} (${userId})`);

    channel.onmessage = (event) => {
      const message: WatchPartyMessage = event.data;
      console.log(`📨 [WatchParty] Received:`, message.type, message);

      // Не обрабатываем свои собственные сообщения
      if (message.userId === userId) {
        console.log(`⏭️ [WatchParty] Skipping own message`);
        return;
      }

      console.log(`✅ [WatchParty] Emitting event:`, message.type);
      this.emit(message.type, message);
    };

    // Сохраняем канал для отправки сообщений
    (this as any).channel = channel;

    // Уведомляем других участников о присоединении
    this.sendMessage({
      type: 'join',
      roomId,
      userId,
      userName,
    });
  }

  disconnect() {
    if ((this as any).channel) {
      (this as any).channel.close();
      (this as any).channel = null;
    }
    this.listeners.clear();
  }

  sendMessage(message: WatchPartyMessage) {
    if ((this as any).channel) {
      console.log(`📤 [WatchParty] Sending:`, message.type, message);
      (this as any).channel.postMessage(message);

      // Также сохраняем в localStorage для персистентности
      const roomKey = `watchparty_room_${message.roomId}`;
      const roomData = JSON.parse(localStorage.getItem(roomKey) || '{}');
      roomData.lastMessage = message;
      roomData.timestamp = Date.now();
      localStorage.setItem(roomKey, JSON.stringify(roomData));
    } else {
      console.warn(`⚠️ [WatchParty] No channel to send message`);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  // Методы для управления воспроизведением
  play(roomId: string, userId: string, currentTime: number) {
    this.sendMessage({
      type: 'play',
      roomId,
      userId,
      data: { currentTime },
    });
  }

  pause(roomId: string, userId: string, currentTime: number) {
    this.sendMessage({
      type: 'pause',
      roomId,
      userId,
      data: { currentTime },
    });
  }

  seek(roomId: string, userId: string, currentTime: number) {
    this.sendMessage({
      type: 'seek',
      roomId,
      userId,
      data: { currentTime },
    });
  }

  sendChat(roomId: string, userId: string, userName: string, message: string) {
    this.sendMessage({
      type: 'chat',
      roomId,
      userId,
      userName,
      data: { message },
    });
  }

  // Генерация уникального ID для комнаты
  static generateRoomId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}

export { WatchPartyService };
export const watchPartyService = new WatchPartyService();

