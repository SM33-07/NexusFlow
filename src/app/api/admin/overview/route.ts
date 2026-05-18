import { NextRequest, NextResponse } from 'next/server';
import {
  demoAuditLogs,
  demoCheckIns,
  demoEscalationLogs,
  demoEscalationRules,
  demoGoals,
  demoNotificationLogs,
  demoProfiles,
  demoQuarterlyUpdates,
} from '@/lib/demoData';
import { getCurrentProfile, hasSupabaseEnv, supabaseRest } from '@/lib/supabaseServer';
import type { AuditLog, CheckIn, EscalationLog, EscalationRule, GoalRecord, NotificationLog, Profile, QuarterlyUpdate } from '@/lib/types';

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });

  if (!hasSupabaseEnv) {
    return NextResponse.json({
      profiles: demoProfiles,
      goals: demoGoals,
      checkIns: demoCheckIns,
      updates: demoQuarterlyUpdates,
      auditLogs: demoAuditLogs,
      notificationLogs: demoNotificationLogs,
      escalationRules: demoEscalationRules,
      escalationLogs: demoEscalationLogs,
      integrations: {
        entra: {
          enabled: Boolean(process.env.MICROSOFT_ENTRA_CLIENT_ID),
          tenantId: process.env.MICROSOFT_ENTRA_TENANT_ID ?? 'demo-tenant',
          hierarchyAttribute: 'manager',
          groupRoleMap: {
            'Nexus-Employees': 'employee',
            'Nexus-Managers': 'manager',
            'Nexus-HR-Admins': 'admin',
          },
        },
        teams: {
          enabled: Boolean(process.env.TEAMS_WEBHOOK_URL),
          adaptiveCards: true,
          deepLinks: true,
        },
        email: {
          enabled: Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY),
          provider: process.env.RESEND_API_KEY ? 'Resend' : process.env.SMTP_HOST ? 'SMTP' : 'demo-log',
        },
      },
    });
  }

  const [profiles, goals, checkIns, updates, auditLogs, notificationLogs, escalationRules, escalationLogs] = await Promise.all([
    supabaseRest<Profile[]>('profiles?select=id,full_name,email,role,job_title,department,manager_id,session_version'),
    supabaseRest<GoalRecord[]>('goals?select=*&order=created_at.desc'),
    supabaseRest<CheckIn[]>('check_ins?select=*&order=created_at.desc'),
    supabaseRest<QuarterlyUpdate[]>('quarterly_updates?select=*&order=created_at.desc'),
    supabaseRest<AuditLog[]>('audit_logs?select=*&order=created_at.desc&limit=20'),
    supabaseRest<NotificationLog[]>('notification_logs?select=*&order=created_at.desc&limit=20'),
    supabaseRest<EscalationRule[]>('escalation_rules?select=*&order=created_at.asc'),
    supabaseRest<EscalationLog[]>('escalation_logs?select=*&order=created_at.desc&limit=20'),
  ]);

  return NextResponse.json({
    profiles,
    goals,
    checkIns,
    updates,
    auditLogs,
    notificationLogs,
    escalationRules,
    escalationLogs,
    integrations: {
      entra: {
        enabled: Boolean(process.env.MICROSOFT_ENTRA_CLIENT_ID),
        tenantId: process.env.MICROSOFT_ENTRA_TENANT_ID ?? 'not-configured',
        hierarchyAttribute: 'manager',
        groupRoleMap: {
          'Nexus-Employees': 'employee',
          'Nexus-Managers': 'manager',
          'Nexus-HR-Admins': 'admin',
        },
      },
      teams: {
        enabled: Boolean(process.env.TEAMS_WEBHOOK_URL),
        adaptiveCards: true,
        deepLinks: true,
      },
      email: {
        enabled: Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY),
        provider: process.env.RESEND_API_KEY ? 'Resend' : process.env.SMTP_HOST ? 'SMTP' : 'demo-log',
      },
    },
  });
}
