import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { testMessages } from '@/lib/db/schema';

export async function GET() {
  const rows = await db.select().from(testMessages);

  return NextResponse.json({ ok: true, rows });
}

export async function POST() {
  await db.insert(testMessages).values({
    message: 'Hello from Drizzle + Neon + Next.js',
  });

  return NextResponse.json({ ok: true });
}
