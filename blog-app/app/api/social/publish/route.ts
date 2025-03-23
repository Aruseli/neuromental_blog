import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { SocialService } from '@/lib/social/social-service';
import { PublishRequest, SocialPlatform } from '@/lib/social/types';

const socialService = new SocialService();

// Публикация поста в социальные сети
export async function POST(req: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Неавторизованный доступ' }, { status: 401 });
    }

    // Получаем данные из запроса
    const data = await req.json();
    const { postId, platforms, scheduledAt } = data;

    // Проверяем обязательные поля
    if (!postId || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Необходимо указать postId и хотя бы одну платформу' },
        { status: 400 }
      );
    }

    // Проверяем, что все платформы поддерживаются
    const supportedPlatforms: SocialPlatform[] = ['vk', 'telegram', 'thread'];
    const validPlatforms = platforms.every(p => supportedPlatforms.includes(p as SocialPlatform));
    
    if (!validPlatforms) {
      return NextResponse.json(
        { error: 'Указаны неподдерживаемые платформы' },
        { status: 400 }
      );
    }

    // Создаем запрос на публикацию
    const publishRequest: PublishRequest = {
      postId,
      platforms: platforms as SocialPlatform[],
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    };

    // Адаптируем контент для всех платформ
    const adaptedContentMap = await socialService.adaptContent(postId);

    // Публикуем на каждой платформе
    const results = [];
    for (const platform of publishRequest.platforms) {
      const adaptedContent = adaptedContentMap[platform];
      const result = await socialService.publish(
        { ...publishRequest, platforms: [platform] },
        adaptedContent
      );
      results.push(...result);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Ошибка при публикации в социальные сети:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Неизвестная ошибка' },
      { status: 500 }
    );
  }
}

// Получение статуса публикаций для поста
export async function GET(req: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Неавторизованный доступ' }, { status: 401 });
    }

    // Получаем ID поста из запроса
    const url = new URL(req.url);
    const postId = url.searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Необходимо указать postId' },
        { status: 400 }
      );
    }

    // Здесь должен быть код для получения публикаций из БД
    // Для примера возвращаем заглушку
    return NextResponse.json({ publications: [] });
  } catch (error) {
    console.error('Ошибка при получении статуса публикаций:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Неизвестная ошибка' },
      { status: 500 }
    );
  }
}
