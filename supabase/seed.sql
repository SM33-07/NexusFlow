-- Nexus deploy-ready demo data.
-- employee@nexus.demo / NexusEmp@2026
-- manager@nexus.demo / NexusMgr@2026
-- admin@nexus.demo / NexusAdmin@2026

insert into public.profiles (id, full_name, email, password_hash, session_version, role, job_title, department, manager_id) values
  ('11111111-1111-1111-1111-111111111111', 'Alex Mercer', 'employee@nexus.demo', 'pbkdf2:100000:nexus-employee-salt-v2:f429d013e1eb9145d8e3ddf154219919a0b7252d960cb329c583821dfd8f1467', 1, 'employee', 'Frontend Engineer', 'Product Engineering', '22222222-2222-2222-2222-222222222222'),
  ('22222222-2222-2222-2222-222222222222', 'Sarah Connor', 'manager@nexus.demo', 'pbkdf2:100000:nexus-manager-salt-v2:7a930ed5b3285cac8ac66ca115d40599026f75267a0d16c199eefba047d617b1', 1, 'manager', 'Engineering Manager', 'Product Engineering', '33333333-3333-3333-3333-333333333333'),
  ('33333333-3333-3333-3333-333333333333', 'Priya Rao', 'admin@nexus.demo', 'pbkdf2:100000:nexus-admin-salt-v2:453303a699d1c7d608237d03d0e89cf3f8b698da1e458fb7f1e8db0393c206a9', 1, 'admin', 'People Ops Admin', 'Business Excellence', null)
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  password_hash = excluded.password_hash,
  session_version = public.profiles.session_version + 1,
  role = excluded.role,
  job_title = excluded.job_title,
  department = excluded.department,
  manager_id = excluded.manager_id;

insert into public.goals (id, owner_id, parent_goal_id, shared_goal_id, primary_owner_id, title, description, category, uom_type, target_value, baseline_value, weightage, status, progress, position_x, position_y, is_hub, is_shared, locked) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', null, null, null, 'Increase Q3 Software Revenue', 'Departmental revenue KPI cascaded to Product Engineering for the active performance cycle.', 'Revenue Growth', 'Min (Higher is better)', '5000000', 3500000, 40, 'approved', 65, 400, 50, true, false, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Launch Enterprise Portal', 'Ship the enterprise customer portal with SSO, usage analytics, and onboarding checklist completed before the committed deadline.', 'Product Innovation', 'Timeline', '2026-06-30', null, 20, 'approved', 100, 200, 250, false, true, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', null, null, 'Reduce Cloud Hosting Costs', 'Reduce avoidable idle infrastructure spend while preserving production reliability and release velocity.', 'Operational Excellence', 'Max (Lower is better)', '15', 100, 20, 'submitted', 30, 600, 250, false, false, false),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', null, null, 'Improve Lighthouse Performance Score', 'Raise production Lighthouse performance score through bundle splitting, image optimization, and caching improvements.', 'Product Innovation', 'Min (Higher is better)', '95', 72, 20, 'draft', 72, 410, 430, false, false, false)
on conflict (id) do update set
  owner_id = excluded.owner_id,
  parent_goal_id = excluded.parent_goal_id,
  shared_goal_id = excluded.shared_goal_id,
  primary_owner_id = excluded.primary_owner_id,
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  uom_type = excluded.uom_type,
  target_value = excluded.target_value,
  baseline_value = excluded.baseline_value,
  weightage = excluded.weightage,
  status = excluded.status,
  progress = excluded.progress,
  position_x = excluded.position_x,
  position_y = excluded.position_y,
  is_hub = excluded.is_hub,
  is_shared = excluded.is_shared,
  locked = excluded.locked;

insert into public.quarterly_updates (id, goal_id, quarter, actual_value, achievement_status, computed_score, comment, created_at) values
  ('c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Q4 2025', '2025-12-20', 'Completed', 100, 'Shipped before target date.', '2025-12-20T10:30:00Z'),
  ('c2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Q4 2025', '23', 'On Track', 65, 'Savings started after cloud rightsizing.', '2025-12-28T10:30:00Z'),
  ('c3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Q1 2026', '2026-03-25', 'Completed', 100, 'Portal rollout remained on plan.', '2026-03-25T10:30:00Z'),
  ('c4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Q1 2026', '18', 'On Track', 83, 'Reserved instances improved cost curve.', '2026-03-29T10:30:00Z')
on conflict (id) do update set
  actual_value = excluded.actual_value,
  achievement_status = excluded.achievement_status,
  computed_score = excluded.computed_score,
  comment = excluded.comment;

insert into public.check_ins (id, employee_id, manager_id, comment, created_at) values
  ('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Reviewed cloud cost blockers and agreed on reserved instance cleanup before Q2 close.', '2026-04-16T10:30:00Z')
on conflict (id) do update set comment = excluded.comment;

insert into public.audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at) values
  ('e1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'APPROVE_GOAL', 'goal', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '{"status":{"from":"submitted","to":"approved"}}', '2026-04-17T10:30:00Z')
on conflict (id) do update set metadata = excluded.metadata;

insert into public.notification_logs (id, recipient_id, channel, event_type, title, message, deep_link, status, created_at) values
  ('f1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'teams', 'goal_submitted', 'Goal sheet submitted', 'Alex Mercer submitted Q2 goals for manager approval.', '/manager?employee=11111111-1111-1111-1111-111111111111', 'sent', '2026-05-04T09:30:00Z'),
  ('f2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'email', 'goal_approved', 'Goals approved', 'Your Launch Enterprise Portal goal has been approved and locked.', '/', 'sent', '2026-05-05T11:30:00Z'),
  ('f3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'email', 'checkin_reminder', 'Q2 check-in reminder', 'Complete quarterly check-ins for direct reports before the active window closes.', '/manager', 'queued', '2026-05-12T08:30:00Z')
on conflict (id) do update set status = excluded.status;

insert into public.escalation_rules (id, name, trigger_type, threshold_days, first_notify_role, second_notify_role, final_notify_role, active) values
  ('90000000-0000-0000-0000-000000000001', 'Goal submission overdue', 'goal_submission_overdue', 5, 'employee', 'manager', 'admin', true),
  ('90000000-0000-0000-0000-000000000002', 'Manager approval overdue', 'manager_approval_overdue', 3, 'manager', 'admin', 'admin', true),
  ('90000000-0000-0000-0000-000000000003', 'Quarterly check-in overdue', 'checkin_overdue', 7, 'employee', 'manager', 'admin', true)
on conflict (id) do update set
  threshold_days = excluded.threshold_days,
  active = excluded.active;

insert into public.escalation_logs (id, rule_id, employee_id, manager_id, level, message, status, created_at) values
  ('91000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 1, 'Reduce Cloud Hosting Costs is pending manager approval beyond the configured threshold.', 'open', '2026-05-09T09:00:00Z')
on conflict (id) do update set status = excluded.status;
