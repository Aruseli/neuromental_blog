import { AdaptedContent, PublishResult, SocialAccount, SocialPublication, SocialStats } from './types';
import { BaseSocialAdapter } from './adapter';

// Адаптер для работы с Telegram API
export class TelegramAdapter extends BaseSocialAdapter {
  private botToken: string;
  private apiUrl: string;

  constructor() {
    super('telegram');
    // Получаем настройки из переменных окружения
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;

    if (!this.botToken) {
      console.warn('Telegram API credentials are not properly configured');
    }
  }

  // Подключение к Telegram (для Telegram используется бот, поэтому здесь просто создаем запись)
  async connect(channelId: string): Promise<SocialAccount> {
    try {
      // Проверяем, что канал существует и бот имеет доступ к нему
      const response = await fetch(`${this.apiUrl}/getChat?chat_id=${channelId}`);
      
      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description}`);
      }

      // Создаем запись об аккаунте
      const now = new Date();

      return {
        id: '', // Будет заполнено при сохранении в БД
        userId: '', // Будет заполнено при сохранении в БД
        platform: 'telegram',
        accessToken: this.botToken, // Используем токен бота
        platformUserId: channelId,
        platformUsername: data.result.title || data.result.username || channelId,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error connecting to Telegram:', error);
      throw error;
    }
  }

  // Публикация контента в Telegram
  async publish(account: SocialAccount, content: AdaptedContent): Promise<PublishResult> {
    try {
      // Формируем текст сообщения в формате Markdown
      const text = this.formatMarkdown(content);
      
      // Отправляем сообщение
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: account.platformUserId,
          text,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description}`);
      }

      // Если есть изображения, отправляем их отдельно
      if (content.images && content.images.length > 0) {
        await this.sendImages(account.platformUserId, content.images);
      }

      // Формируем результат
      return {
        success: true,
        platform: 'telegram',
        status: 'published',
        externalId: data.result.message_id.toString(),
        // Для публичных каналов можно сформировать ссылку
        externalUrl: account.platformUsername && account.platformUsername.startsWith('@') 
          ? `https://t.me/${account.platformUsername.substring(1)}/${data.result.message_id}`
          : undefined,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Получение статистики публикации
  async getStats(publication: SocialPublication): Promise<SocialStats> {
    // Telegram API не предоставляет статистику для обычных сообщений
    // Для каналов можно использовать метод getChatMemberCount
    return {
      id: '',
      publicationId: publication.id,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      collectedAt: new Date()
    };
  }

  // Обновление токена (для Telegram не требуется, так как используется постоянный токен бота)
  async refreshToken(account: SocialAccount): Promise<SocialAccount> {
    return account;
  }

  // Адаптация контента блога для Telegram
  protected async adaptContent(postId: string): Promise<AdaptedContent> {
    // Здесь должен быть код для получения поста из БД и адаптации его для Telegram
    // Для примера возвращаем заглушку
    return {
      title: 'Тестовый пост',
      text: 'Содержимое тестового поста',
      images: []
    };
  }

  // Форматирование текста в Markdown для Telegram
  private formatMarkdown(content: AdaptedContent): string {
    // Экранируем специальные символы
    const escapeMarkdown = (text: string) => {
      return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
    };

    // Форматируем заголовок и текст
    let formattedText = `*${escapeMarkdown(content.title)}*\n\n${escapeMarkdown(content.text)}`;
    
    // Добавляем ссылку, если есть
    if (content.link) {
      formattedText += `\n\n[Подробнее](${content.link})`;
    }
    
    return formattedText;
  }

  // Отправка изображений
  private async sendImages(chatId: string, imageUrls: string[]): Promise<void> {
    for (const imageUrl of imageUrls) {
      try {
        await fetch(`${this.apiUrl}/sendPhoto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            photo: imageUrl,
          }),
        });
      } catch (error) {
        console.error('Error sending image to Telegram:', error);
      }
    }
  }
}
