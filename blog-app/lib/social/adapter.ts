import { AdaptedContent, PublishResult, SocialAccount, SocialPlatform, SocialPlatformAdapter, SocialPublication, SocialStats } from './types';

// Базовый класс для всех адаптеров социальных сетей
export abstract class BaseSocialAdapter implements SocialPlatformAdapter {
  protected platform: SocialPlatform;

  constructor(platform: SocialPlatform) {
    this.platform = platform;
  }

  // Метод для подключения к социальной сети (авторизация)
  abstract connect(code: string): Promise<SocialAccount>;

  // Метод для публикации контента
  abstract publish(account: SocialAccount, content: AdaptedContent): Promise<PublishResult>;

  // Метод для получения статистики
  abstract getStats(publication: SocialPublication): Promise<SocialStats>;

  // Метод для обновления токена
  abstract refreshToken(account: SocialAccount): Promise<SocialAccount>;

  // Общий метод для адаптации контента блога под формат соцсети
  protected abstract adaptContent(postId: string): Promise<AdaptedContent>;

  // Общий метод для проверки валидности токена
  protected isTokenValid(account: SocialAccount): boolean {
    if (!account.tokenExpiresAt) return false;
    const now = new Date();
    return account.tokenExpiresAt > now;
  }

  // Общий метод для обработки ошибок
  protected handleError(error: any): PublishResult {
    console.error(`Error in ${this.platform} adapter:`, error);
    return {
      success: false,
      platform: this.platform,
      status: 'failed',
      errorMessage: error.message || 'Unknown error',
    };
  }
}

// Фабрика для создания адаптеров
export class SocialAdapterFactory {
  private static adapters: Record<SocialPlatform, SocialPlatformAdapter> = {} as Record<SocialPlatform, SocialPlatformAdapter>;

  // Регистрация адаптера
  static register(platform: SocialPlatform, adapter: SocialPlatformAdapter): void {
    this.adapters[platform] = adapter;
  }

  // Получение адаптера
  static getAdapter(platform: SocialPlatform): SocialPlatformAdapter {
    const adapter = this.adapters[platform];
    if (!adapter) {
      throw new Error(`Adapter for platform ${platform} not registered`);
    }
    return adapter;
  }
}
