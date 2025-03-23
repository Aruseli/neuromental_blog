import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { SocialService } from '@/lib/social/social-service';
import { SocialPlatform } from '@/lib/social/types';

const socialService = new SocialService();

// Получение всех социальных аккаунтов пользователя
export async function GET(req: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Здесь должен быть код для получения аккаунтов из БД
    // Для примера возвращаем заглушку
    return NextResponse.json({ accounts: [] });
  } catch (error) {
    console.error('Error getting social accounts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Подключение нового социального аккаунта
export async function POST(req: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем данные из запроса
    const data = await req.json();
    const { platform, code } = data;

    // Проверяем обязательные поля
    if (!platform || !code) {
      return NextResponse.json(
        { error: 'Platform and code are required' },
        { status: 400 }
      );
    }

    // Проверяем, что платформа поддерживается
    if (!['vk', 'telegram', 'thread'].includes(platform)) {
      return NextResponse.json(
        { error: 'Unsupported platform' },
        { status: 400 }
      );
    }

    // Подключаем аккаунт
    // Используем email как идентификатор пользователя, так как NextAuth не гарантирует наличие id
    const userId = session.user.email || '';
    const account = await socialService.connectAccount(
      platform as SocialPlatform,
      code,
      userId
    );

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error connecting social account:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Удаление социального аккаунта
export async function DELETE(req: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем ID аккаунта из запроса
    const url = new URL(req.url);
    const accountId = url.searchParams.get('id');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Здесь должен быть код для удаления аккаунта из БД
    // Для примера просто возвращаем успешный результат
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social account:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
