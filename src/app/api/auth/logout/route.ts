import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  for (const name of ['nexus-session', 'nexus-access-token', 'nexus-refresh-token', 'nexus-user-id', 'nexus-role', 'nexus-demo-role']) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  return response;
}
