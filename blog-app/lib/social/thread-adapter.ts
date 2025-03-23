import { AdaptedContent, PublishResult, SocialAccount, SocialPublication, SocialStats } from './types';
import { BaseSocialAdapter } from './adapter';

// Адаптер для работы с Thread API (Meta)
export class ThreadAdapter extends BaseSocialAdapter {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private apiVersion: string;

  constructor() {
    super('thread');
    // Получаем настройки из переменных окружения
    this.clientId = process.env.THREAD_CLIENT_ID || '';
    this.clientSecret = process.env.THREAD_CLIENT_SECRET || '';
    this.redirectUri = process.env.THREAD_REDIRECT_URI || '';
    this.apiVersion = process.env.THREAD_API_VERSION || 'v18.0';

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      console.warn('Thread API credentials are not properly configured');
    }
  }

  // Подключение к Thread (через Instagram Graph API)
  async connect(code: string): Promise<SocialAccount> {
    try {
      // Обмен кода на токен доступа
      const tokenResponse = await fetch(`https://api.instagram.com/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Thread API error: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        throw new Error('Failed to get access token from Thread');
      }

      // Получаем долгосрочный токен
      const longLivedTokenResponse = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${this.clientSecret}&access_token=${tokenData.access_token}`
      );

      if (!longLivedTokenResponse.ok) {
        throw new Error(`Thread API error: ${longLivedTokenResponse.statusText}`);
      }

      const longLivedTokenData = await longLivedTokenResponse.json();

      // Получаем информацию о пользователе
      const userInfo = await this.getUserInfo(longLivedTokenData.access_token);

      // Создаем запись об аккаунте
      const now = new Date();
      const expiresAt = new Date(now.getTime() + longLivedTokenData.expires_in * 1000);

      return {
        id: '', // Будет заполнено при сохранении в БД
        userId: '', // Будет заполнено при сохранении в БД
        platform: 'thread',
        accessToken: longLivedTokenData.access_token,
        tokenExpiresAt: expiresAt,
        platformUserId: userInfo.id,
        platformUsername: userInfo.username,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error connecting to Thread:', error);
      throw error;
    }
  }

  // Публикация контента в Thread
  async publish(account: SocialAccount, content: AdaptedContent): Promise<PublishResult> {
    try {
      // Проверяем валидность токена
      if (!this.isTokenValid(account)) {
        account = await this.refreshToken(account);
      }

      // Примечание: Thread API пока не имеет официального API для публикации
      // Это заглушка, которая будет обновлена, когда Meta предоставит официальный API
      
      // Для демонстрации предположим, что мы используем Instagram Graph API
      // Сначала создаем медиа-контейнер
      let mediaId = null;
      
      if (content.images && content.images.length > 0) {
        // Создаем медиа-контейнер с изображением
        const createMediaResponse = await fetch(
          `https://graph.instagram.com/${this.apiVersion}/${account.platformUserId}/media?image_url=${encodeURIComponent(content.images[0])}&caption=${encodeURIComponent(`${content.title}\n\n${content.text}`)}&access_token=${account.accessToken}`
        );
        
        if (!createMediaResponse.ok) {
          throw new Error(`Thread API error: ${createMediaResponse.statusText}`);
        }
        
        const mediaData = await createMediaResponse.json();
        mediaId = mediaData.id;
      } else {
        // Без изображения (только текст) - в реальности Thread требует изображение
        // Это заглушка для демонстрации
        throw new Error('Thread requires at least one image for publication');
      }
      
      // Публикуем медиа
      const publishResponse = await fetch(
        `https://graph.instagram.com/${this.apiVersion}/${account.platformUserId}/media_publish?creation_id=${mediaId}&access_token=${account.accessToken}`,
        {
          method: 'POST',
        }
      );
      
      if (!publishResponse.ok) {
        throw new Error(`Thread API error: ${publishResponse.statusText}`);
      }
      
      const publishData = await publishResponse.json();
      
      // Формируем результат
      return {
        success: true,
        platform: 'thread',
        status: 'published',
        externalId: publishData.id,
        externalUrl: `https://www.threads.net/@${account.platformUsername}/post/${publishData.id}`,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Получение статистики публикации
  async getStats(publication: SocialPublication): Promise<SocialStats> {
    try {
      // Здесь должен быть код для получения статистики из Thread API
      // Для примера возвращаем заглушку
      return {
        id: '',
        publicationId: publication.id,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        collectedAt: new Date()
      };
    } catch (error) {
      console.error('Error getting Thread stats:', error);
      throw error;
    }
  }

  // Обновление токена
  async refreshToken(account: SocialAccount): Promise<SocialAccount> {
    try {
      // Обновляем долгосрочный токен
      const response = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${account.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Thread API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Обновляем данные аккаунта
      const now = new Date();
      const expiresAt = new Date(now.getTime() + data.expires_in * 1000);
      
      return {
        ...account,
        accessToken: data.access_token,
        tokenExpiresAt: expiresAt,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error refreshing Thread token:', error);
      throw error;
    }
  }

  // Адаптация контента блога для Thread
  protected async adaptContent(postId: string): Promise<AdaptedContent> {
    // Здесь должен быть код для получения поста из БД и адаптации его для Thread
    // Для примера возвращаем заглушку
    return {
      title: 'Тестовый пост',
      text: 'Содержимое тестового поста',
      images: ['https://example.com/image.jpg'] // Thread требует хотя бы одно изображение
    };
  }

  // Получение информации о пользователе
  private async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new Error(`Thread API error: ${response.statusText}`);
    }
    
    return await response.json();
  }
}
