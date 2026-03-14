import { NextResponse, type NextRequest } from 'next/server';
import { getDb, schema } from '@eye1/db';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);

    const insightsList = await db
      .select()
      .from(schema.insights)
      .orderBy(desc(schema.insights.generatedAt))
      .limit(Math.min(limit, 100));

    return NextResponse.json({ insights: insightsList, total: insightsList.length });
  } catch (error) {
    console.error('Failed to fetch insights:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}
