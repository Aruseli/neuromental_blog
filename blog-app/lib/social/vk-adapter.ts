import { AdaptedContent, PublishResult, SocialAccount, SocialPublication, SocialStats } from './types';
import { BaseSocialAdapter } from './adapter';

// Адаптер для работы с VK API
export class VKAdapter extends BaseSocialAdapter {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private apiVersion: string;

  constructor() {
    super('vk');
    // Получаем настройки из переменных окружения
    this.clientId = process.env.VK_CLIENT_ID || '';
    this.clientSecret = process.env.VK_CLIENT_SECRET || '';
    this.redirectUri = process.env.VK_REDIRECT_URI || '';
    this.apiVersion = process.env.VK_API_VERSION || '5.131';

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      console.warn('VK API credentials are not properly configured');
    }
  }

  // Подключение к VK (обмен кода на токен)
  async connect(code: string): Promise<SocialAccount> {
    try {
      const response = await fetch(`https://oauth.vk.com/access_token?client_id=${this.clientId}&client_secret=${this.clientSecret}&redirect_uri=${this.redirectUri}&code=${code}`);
      
      if (!response.ok) {
        throw new Error(`VK API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('Failed to get access token from VK');
      }

      // Получаем информацию о пользователе
      const userInfo = await this.getUserInfo(data.access_token);

      // Создаем запись об аккаунте
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (data.expires_in ? data.expires_in * 1000 : 0));

      return {
        id: '', // Будет заполнено при сохранении в БД
        userId: '', // Будет заполнено при сохранении в БД
        platform: 'vk',
        accessToken: data.access_token,
        tokenExpiresAt: expiresAt,
        platformUserId: userInfo.id.toString(),
        platformUsername: `${userInfo.first_name} ${userInfo.last_name}`,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error connecting to VK:', error);
      throw error;
    }
  }

  // Публикация контента в VK
  async publish(account: SocialAccount, content: AdaptedContent): Promise<PublishResult> {
    try {
      // Проверяем валидность токена
      if (!this.isTokenValid(account)) {
        account = await this.refreshToken(account);
      }

      // Формируем параметры запроса
      const params = new URLSearchParams();
      params.append('access_token', account.accessToken);
      params.append('v', this.apiVersion);
      params.append('message', `${content.title}\n\n${content.text}`);
      
      if (content.link) {
        params.append('attachments', content.link);
      }

      // Если есть изображения, сначала загружаем их
      if (content.images && content.images.length > 0) {
        const photoAttachments = await this.uploadPhotos(account.accessToken, content.images);
        if (photoAttachments) {
          params.append('attachments', photoAttachments);
        }
      }

      // Отправляем запрос на публикацию
      const response = await fetch(`https://api.vk.com/method/wall.post?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`VK API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`VK API error: ${data.error.error_msg}`);
      }

      // Формируем результат
      return {
        success: true,
        platform: 'vk',
        status: 'published',
        externalId: data.response?.post_id?.toString(),
        externalUrl: `https://vk.com/wall${account.platformUserId}_${data.response?.post_id}`,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Получение статистики публикации
  async getStats(publication: SocialPublication): Promise<SocialStats> {
    try {
      // Здесь должен быть код для получения статистики из VK API
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
      console.error('Error getting VK stats:', error);
      throw error;
    }
  }

  // Обновление токена (в VK нужно заново авторизоваться, так как refresh token не предоставляется)
  async refreshToken(account: SocialAccount): Promise<SocialAccount> {
    // В VK API нет refresh token, поэтому просто возвращаем текущий аккаунт
    // В реальном приложении здесь нужно перенаправить пользователя на повторную авторизацию
    console.warn('VK tokens cannot be refreshed automatically. User needs to re-authorize.');
    return account;
  }

  // Адаптация контента блога для VK
  protected async adaptContent(postId: string): Promise<AdaptedContent> {
    // Здесь должен быть код для получения поста из БД и адаптации его для VK
    // Для примера возвращаем заглушку
    return {
      title: 'Тестовый пост',
      text: 'Содержимое тестового поста',
      images: []
    };
  }

  // Вспомогательный метод для получения информации о пользователе
  private async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(`https://api.vk.com/method/users.get?access_token=${accessToken}&v=${this.apiVersion}`);
    
    if (!response.ok) {
      throw new Error(`VK API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`VK API error: ${data.error.error_msg}`);
    }

    return data.response[0];
  }

  // Вспомогательный метод для загрузки фотографий
  private async uploadPhotos(accessToken: string, imageUrls: string[]): Promise<string | null> {
    try {
      // Получаем сервер для загрузки
      const serverResponse = await fetch(`https://api.vk.com/method/photos.getWallUploadServer?access_token=${accessToken}&v=${this.apiVersion}`);
      const serverData = await serverResponse.json();
      
      if (serverData.error) {
        throw new Error(`VK API error: ${serverData.error.error_msg}`);
      }

      const uploadUrl = serverData.response.upload_url;
      
      // Загружаем фото (для простоты примера только первое)
      // В реальном приложении нужно загрузить все фото и обработать их
      const imageUrl = imageUrls[0];
      
      // Здесь должен быть код для загрузки фото на сервер VK
      // Это упрощенный пример, в реальном приложении нужно использовать FormData и загрузить файл
      
      // Сохраняем фото на стене
      // Это заглушка, в реальном приложении нужно использовать результаты загрузки
      return null;
    } catch (error) {
      console.error('Error uploading photos to VK:', error);
      return null;
    }
  }
}
