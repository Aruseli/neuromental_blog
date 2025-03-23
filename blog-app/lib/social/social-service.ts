import { AdaptedContent, PublishRequest, PublishResult, SocialAccount, SocialPlatform, SocialPublication, SocialStats } from './types';
import { SocialAdapterFactory } from './adapter';
import { VKAdapter } from './vk-adapter';
import { TelegramAdapter } from './telegram-adapter';
import { ThreadAdapter } from './thread-adapter';

// Регистрируем адаптеры
SocialAdapterFactory.register('vk', new VKAdapter());
SocialAdapterFactory.register('telegram', new TelegramAdapter());
SocialAdapterFactory.register('thread', new ThreadAdapter());

// Сервис для работы с социальными сетями
export class SocialService {
  // Подключение к социальной сети
  async connectAccount(platform: SocialPlatform, code: string, userId: string): Promise<SocialAccount> {
    try {
      const adapter = SocialAdapterFactory.getAdapter(platform);
      const account = await adapter.connect(code);
      
      // Добавляем userId
      account.userId = userId;
      
      // Здесь должен быть код для сохранения аккаунта в БД
      // Для примера просто возвращаем аккаунт
      return account;
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      throw error;
    }
  }

  // Публикация контента в социальные сети
  async publish(request: PublishRequest, content: AdaptedContent): Promise<PublishResult[]> {
    const results: PublishResult[] = [];
    
    for (const platform of request.platforms) {
      try {
        // Получаем адаптер для платформы
        const adapter = SocialAdapterFactory.getAdapter(platform);
        
        // Получаем аккаунт пользователя для этой платформы
        const account = await this.getAccountForPlatform(platform, request.postId);
        
        if (!account) {
          results.push({
            success: false,
            platform,
            status: 'failed',
            errorMessage: `No connected account found for platform ${platform}`,
          });
          continue;
        }
        
        // Публикуем контент
        const result = await adapter.publish(account, content);
        
        // Если публикация успешна, сохраняем информацию о ней
        if (result.success) {
          await this.savePublication({
            id: '', // Будет заполнено при сохранении в БД
            postId: request.postId,
            socialAccountId: account.id,
            platform: platform,
            status: result.status,
            externalUrl: result.externalUrl,
            externalId: result.externalId,
            publishedAt: new Date(),
            scheduledAt: request.scheduledAt,
            createdAt: new Date(),
          });
        }
        
        results.push(result);
      } catch (error) {
        console.error(`Error publishing to ${platform}:`, error);
        results.push({
          success: false,
          platform,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return results;
  }

  // Получение статистики публикаций
  async getStats(postId: string): Promise<SocialStats[]> {
    try {
      // Получаем все публикации для поста
      const publications = await this.getPublicationsForPost(postId);
      const stats: SocialStats[] = [];
      
      for (const publication of publications) {
        try {
          const adapter = SocialAdapterFactory.getAdapter(publication.platform as SocialPlatform);
          const publicationStats = await adapter.getStats(publication);
          stats.push(publicationStats);
        } catch (error) {
          console.error(`Error getting stats for publication ${publication.id}:`, error);
        }
      }
      
      return stats;
    } catch (error) {
      console.error(`Error getting stats for post ${postId}:`, error);
      throw error;
    }
  }

  // Адаптация контента для всех платформ
  async adaptContent(postId: string): Promise<Record<SocialPlatform, AdaptedContent>> {
    const result: Partial<Record<SocialPlatform, AdaptedContent>> = {};
    const platforms: SocialPlatform[] = ['vk', 'telegram', 'thread'];
    
    // Получаем базовый контент поста
    const baseContent = await this.getPostContent(postId);
    
    for (const platform of platforms) {
      try {
        // Адаптируем контент для каждой платформы
        result[platform] = await this.adaptContentForPlatform(platform, baseContent);
      } catch (error) {
        console.error(`Error adapting content for ${platform}:`, error);
      }
    }
    
    return result as Record<SocialPlatform, AdaptedContent>;
  }

  // Вспомогательные методы (заглушки, которые должны быть реализованы с использованием БД)
  
  // Получение аккаунта для платформы
  private async getAccountForPlatform(platform: SocialPlatform, postId: string): Promise<SocialAccount | null> {
    // Здесь должен быть код для получения аккаунта из БД
    // Для примера возвращаем заглушку
    return null;
  }
  
  // Сохранение публикации
  private async savePublication(publication: SocialPublication): Promise<SocialPublication> {
    // Здесь должен быть код для сохранения публикации в БД
    // Для примера просто возвращаем публикацию
    return publication;
  }
  
  // Получение публикаций для поста
  private async getPublicationsForPost(postId: string): Promise<SocialPublication[]> {
    // Здесь должен быть код для получения публикаций из БД
    // Для примера возвращаем пустой массив
    return [];
  }
  
  // Получение контента поста
  private async getPostContent(postId: string): Promise<any> {
    // Здесь должен быть код для получения контента поста из БД
    // Для примера возвращаем заглушку
    return {
      title: 'Тестовый пост',
      content: 'Содержимое тестового поста',
      images: [],
      url: `https://example.com/blog/post/${postId}`,
    };
  }
  
  // Адаптация контента для конкретной платформы
  private async adaptContentForPlatform(platform: SocialPlatform, baseContent: any): Promise<AdaptedContent> {
    // Базовая адаптация контента
    const adaptedContent: AdaptedContent = {
      title: baseContent.title,
      text: baseContent.content,
      images: baseContent.images || [],
      link: baseContent.url,
    };
    
    // Специфичная адаптация для каждой платформы
    switch (platform) {
      case 'vk':
        // VK поддерживает длинные тексты и множество изображений
        return adaptedContent;
        
      case 'telegram':
        // Telegram поддерживает Markdown и имеет ограничение на длину сообщения
        return {
          ...adaptedContent,
          text: adaptedContent.text.length > 4000 
            ? adaptedContent.text.substring(0, 3997) + '...' 
            : adaptedContent.text,
        };
        
      case 'thread':
        // Thread имеет ограничение на длину текста и требует хотя бы одно изображение
        return {
          ...adaptedContent,
          text: adaptedContent.text.length > 500 
            ? adaptedContent.text.substring(0, 497) + '...' 
            : adaptedContent.text,
          images: adaptedContent.images.length === 0 
            ? ['https://example.com/placeholder.jpg'] // Заглушка, в реальном приложении нужно использовать реальное изображение
            : adaptedContent.images,
        };
        
      default:
        return adaptedContent;
    }
  }
}
