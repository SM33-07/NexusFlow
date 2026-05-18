-- Replace the UUIDs below with the ids from Authentication -> Users after creating:
-- employee@nexus.demo / manager@nexus.demo / admin@nexus.demo

insert into public.profiles (id, full_name, email, role, job_title, department, manager_id) values
  ('EMPLOYEE_AUTH_UUID', 'Alex Mercer', 'employee@nexus.demo', 'employee', 'Frontend Engineer', 'Product Engineering', 'MANAGER_AUTH_UUID'),
  ('MANAGER_AUTH_UUID', 'Sarah Connor', 'manager@nexus.demo', 'manager', 'Engineering Manager', 'Product Engineering', 'ADMIN_AUTH_UUID'),
  ('ADMIN_AUTH_UUID', 'Priya Rao', 'admin@nexus.demo', 'admin', 'People Ops Admin', 'Business Excellence', null)
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  job_title = excluded.job_title,
  department = excluded.department,
  manager_id = excluded.manager_id;

insert into public.goals (id, owner_id, parent_goal_id, shared_goal_id, primary_owner_id, title, description, category, uom_type, target_value, baseline_value, weightage, status, progress, position_x, position_y, is_hub, is_shared, locked) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'EMPLOYEE_AUTH_UUID', null, null, null, 'Increase Q3 Software Revenue', 'Departmental revenue KPI cascaded to Product Engineering for the active performance cycle.', 'Revenue Growth', 'Min (Higher is better)', '5000000', 3500000, 40, 'approved', 65, 400, 50, true, false, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'EMPLOYEE_AUTH_UUID', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'MANAGER_AUTH_UUID', 'Launch Enterprise Portal', 'Ship the enterprise customer portal with SSO, usage analytics, and onboarding checklist completed before the committed deadline.', 'Product Innovation', 'Timeline', '2026-06-30', null, 20, 'approved', 100, 200, 250, false, true, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'EMPLOYEE_AUTH_UUID', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', null, null, 'Reduce Cloud Hosting Costs', 'Reduce avoidable idle infrastructure spend while preserving production reliability and release velocity.', 'Operational Excellence', 'Max (Lower is better)', '15', 100, 20, 'submitted', 30, 600, 250, false, false, false),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'EMPLOYEE_AUTH_UUID', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', null, null, 'Improve Lighthouse Performance Score', 'Raise production Lighthouse performance score through bundle splitting, image optimization, and caching improvements.', 'Product Innovation', 'Min (Higher is better)', '95', 72, 20, 'draft', 72, 410, 430, false, false, false)
on conflict (id) do update set
  status = excluded.status,
  progress = excluded.progress,
  locked = excluded.locked;

insert into public.quarterly_updates (goal_id, quarter, actual_value, computed_score, comment) values
insert into public.quarterly_updates (goal_id, quarter, actual_value, achievement_status, computed_score, comment) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Q4 2025', '2025-12-20', 'Completed', 100, 'Shipped before target date.'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Q4 2025', '23', 'On Track', 65, 'Savings started after cloud rightsizing.'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Q1 2026', '2026-03-25', 'Completed', 100, 'Portal rollout remained on plan.'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Q1 2026', '18', 'On Track', 83, 'Reserved instances improved cost curve.');

insert into public.check_ins (employee_id, manager_id, comment) values
  ('EMPLOYEE_AUTH_UUID', 'MANAGER_AUTH_UUID', 'Reviewed cloud cost blockers and agreed on reserved instance cleanup before Q2 close.');

insert into public.notification_logs (recipient_id, channel, event_type, title, message, deep_link, status) values
  ('MANAGER_AUTH_UUID', 'teams', 'goal_submitted', 'Goal sheet submitted', 'Alex Mercer submitted Q2 goals for manager approval.', '/manager?employee=EMPLOYEE_AUTH_UUID', 'sent'),
  ('EMPLOYEE_AUTH_UUID', 'email', 'goal_approved', 'Goals approved', 'Your Launch Enterprise Portal goal has been approved and locked.', '/', 'sent'),
  ('MANAGER_AUTH_UUID', 'email', 'checkin_reminder', 'Q2 check-in reminder', 'Complete quarterly check-ins for direct reports before the active window closes.', '/manager', 'queued');

insert into public.escalation_rules (name, trigger_type, threshold_days, first_notify_role, second_notify_role, final_notify_role, active) values
  ('Goal submission overdue', 'goal_submission_overdue', 5, 'employee', 'manager', 'admin', true),
  ('Manager approval overdue', 'manager_approval_overdue', 3, 'manager', 'admin', 'admin', true),
  ('Quarterly check-in overdue', 'checkin_overdue', 7, 'employee', 'manager', 'admin', true);

insert into public.escalation_logs (rule_id, employee_id, manager_id, level, message, status)
select id, 'EMPLOYEE_AUTH_UUID', 'MANAGER_AUTH_UUID', 1, 'Reduce Cloud Hosting Costs is pending manager approval beyond the configured threshold.', 'open'
from public.escalation_rules
where trigger_type = 'manager_approval_overdue'
limit 1;
