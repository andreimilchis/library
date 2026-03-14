import { NextResponse, type NextRequest } from 'next/server';
import { getDb, schema } from '@eye1/db';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const records = await db
      .select()
      .from(schema.normalizedRecords)
      .orderBy(desc(schema.normalizedRecords.normalizedAt))
      .limit(Math.min(limit, 100));

    return NextResponse.json({ events: records, total: records.length });
  } catch (error) {
    console.error('Failed to fetch feed:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
