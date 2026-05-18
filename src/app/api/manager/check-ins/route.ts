import { NextRequest, NextResponse } from 'next/server';
import { getCurrentProfile, getProfileById, hasSupabaseEnv, supabaseRest } from '@/lib/supabaseServer';
import type { CheckIn } from '@/lib/types';

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile || profile.role === 'employee') return NextResponse.json({ error: 'Manager access required.' }, { status: 403 });
  const body = await request.json();
  if (!body.employee_id || !body.comment) return NextResponse.json({ error: 'Employee and comment are required.' }, { status: 400 });

  if (!hasSupabaseEnv) {
    return NextResponse.json({
      checkIn: {
        id: crypto.randomUUID(),
        employee_id: body.employee_id,
        manager_id: profile.id,
        comment: body.comment,
        created_at: new Date().toISOString(),
      },
    });
  }

  const employee = await getProfileById(body.employee_id);
  if (!employee || (profile.role === 'manager' && employee.manager_id !== profile.id)) {
    return NextResponse.json({ error: 'Employee is not in your reporting scope.' }, { status: 403 });
  }

  const rows = await supabaseRest<CheckIn[]>('check_ins', {
    method: 'POST',
    body: JSON.stringify({
      employee_id: body.employee_id,
      manager_id: profile.id,
      comment: body.comment,
    }),
  });

  await supabaseRest('notification_logs', {
    method: 'POST',
    body: JSON.stringify({
      recipient_id: body.employee_id,
      channel: 'email',
      event_type: 'checkin_logged',
      title: 'Manager check-in logged',
      message: `${profile.full_name} logged a quarterly check-in comment.`,
      deep_link: '/',
      status: process.env.SMTP_HOST || process.env.RESEND_API_KEY ? 'sent' : 'queued',
    }),
  }).catch(() => undefined);

  return NextResponse.json({ checkIn: rows[0] });
}
