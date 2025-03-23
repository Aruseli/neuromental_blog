import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { SocialService } from '@/lib/social/social-service';

const socialService = new SocialService();

// Получение статистики публикаций для поста
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

    // Получаем статистику для поста
    const stats = await socialService.getStats(postId);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Ошибка при получении статистики публикаций:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Неизвестная ошибка' },
      { status: 500 }
    );
  }
}
