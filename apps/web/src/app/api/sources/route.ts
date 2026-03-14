import { NextResponse } from 'next/server';
import { getDb, schema } from '@eye1/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    const sources = await db
      .select()
      .from(schema.sourceConnections)
      .where(eq(schema.sourceConnections.status, 'connected'));

    // Strip credentials from response
    const safeSources = sources.map(({ credentials, ...rest }) => rest);

    return NextResponse.json({ sources: safeSources });
  } catch (error) {
    console.error('Failed to fetch sources:', error);
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceType, config } = body;

    if (!sourceType) {
      return NextResponse.json({ error: 'sourceType is required' }, { status: 400 });
    }

    const db = getDb();

    // Check if source already connected
    const existing = await db
      .select()
      .from(schema.sourceConnections)
      .where(eq(schema.sourceConnections.sourceType, sourceType))
      .limit(1);

    if (existing.length > 0 && existing[0]!.status === 'connected') {
      return NextResponse.json({ error: 'Source already connected' }, { status: 409 });
    }

    // Create pending connection
    const [connection] = await db
      .insert(schema.sourceConnections)
      .values({
        userId: '00000000-0000-0000-0000-000000000000', // TODO: from auth
        sourceType,
        status: 'pending_auth',
        config: config || {},
        consentedAt: new Date(),
      })
      .returning();

    // Log audit
    await db.insert(schema.auditLogs).values({
      action: 'source.connect',
      actorType: 'user',
      actorId: 'system', // TODO: from auth
      entityType: 'source_connection',
      entityId: connection!.id,
      metadata: { sourceType },
    });

    return NextResponse.json({ connection });
  } catch (error) {
    console.error('Failed to create source connection:', error);
    return NextResponse.json({ error: 'Failed to create source connection' }, { status: 500 });
  }
}
