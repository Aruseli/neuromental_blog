// Типы данных для интеграции с социальными сетями

// Поддерживаемые платформы
export type SocialPlatform = 'vk' | 'telegram' | 'thread';

// Статус публикации
export type PublicationStatus = 'pending' | 'published' | 'failed' | 'scheduled';

// Аккаунт социальной сети
export interface SocialAccount {
  id: string;
  userId: string;
  platform: SocialPlatform;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  platformUserId: string;
  platformUsername?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Публикация в социальной сети
export interface SocialPublication {
  id: string;
  postId: string;
  socialAccountId: string;
  platform?: SocialPlatform;
  status: PublicationStatus;
  externalUrl?: string;
  externalId?: string;
  publishedAt?: Date;
  scheduledAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

// Статистика публикации
export interface SocialStats {
  id: string;
  publicationId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  collectedAt: Date;
}

// Запрос на публикацию
export interface PublishRequest {
  postId: string;
  platforms: SocialPlatform[];
  scheduledAt?: Date;
}

// Результат публикации
export interface PublishResult {
  success: boolean;
  publicationId?: string;
  platform: SocialPlatform;
  status: PublicationStatus;
  externalUrl?: string;
  externalId?: string;
  errorMessage?: string;
}

// Адаптированный контент для публикации
export interface AdaptedContent {
  title: string;
  text: string;
  images: string[];
  link?: string;
}

// Общий интерфейс для всех социальных платформ
export interface SocialPlatformAdapter {
  connect(code: string): Promise<SocialAccount>;
  publish(account: SocialAccount, content: AdaptedContent): Promise<PublishResult>;
  getStats(publication: SocialPublication): Promise<SocialStats>;
  refreshToken(account: SocialAccount): Promise<SocialAccount>;
}
