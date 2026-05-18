# Nexus BRD Compliance Matrix

This file maps the AtomQuest Hackathon 1.0 problem statement to the implemented demo surface.

| BRD Requirement | Implementation |
| --- | --- |
| Employee creates and submits a Goal Sheet | Goal Canvas supports thrust area, title, description, UoM, target, and weightage; submit uses `/api/goals/submit`. |
| Total weightage must equal 100% | Submit button is locked until the canvas total is exactly 100%. |
| Minimum 10% per goal | Goal side panel validates and blocks injection below 10%. |
| Maximum 8 goals | Goal side panel blocks injection after 8 employee goals. |
| Manager approval workflow | Manager Hub fetches team goals, supports target/weightage edits, Approve, Return, and check-in comments. |
| Goals locked after approval | Approved goals render with green lock styling and cannot be deleted from the employee canvas. |
| Shared goals | Admin / HR can push a shared departmental KPI to employees through `/api/admin/shared-goals`; shared goals carry read-only metadata. |
| Quarterly achievement capture | Each goal node has Log Actuals with actual value, quarter status, and employee comment. |
| Planned vs Actual | Manager Hub and CSV export show planned target, actual achievement, quarter status, and computed score. |
| BRD formulas | `src/lib/scoring.ts` implements Min, Max, Timeline, and Zero-based scoring. |
| Check-in schedule | Admin / HR page lists the required Phase 1, Q1, Q2, Q3, and Q4/Annual windows. |
| Three roles | Supabase profiles support employee, manager, admin. Middleware protects `/manager` and `/admin`. |
| Achievement report | `/api/export/goals` downloads a CSV report with planned vs actual data. |
| Completion dashboard | Admin / HR page shows check-in completion percentage. |
| Audit trail | Goal PATCH actions write to `audit_logs`; Admin / HR displays latest audit events. |
| Goal unlock exception | Admin / HR can unlock approved goals for rework. |
| Good-to-have AI | GoalSidePanel calls `/api/ai/generate-goals`; OpenAI is optional with deterministic fallback templates. |
| Microsoft Entra ID SSO | Admin / HR page includes Entra readiness, group-to-role mapping, hierarchy sync preview, and env hooks for tenant/client configuration. |
| Email and Teams notifications | Goal submission, approval/return, and check-in events write to `notification_logs`; Admin / HR shows Teams/email status and deep links. |
| Rule-based escalations | `escalation_rules` and `escalation_logs` support overdue submission, approval, and check-in triggers; Admin / HR can evaluate rules. |
| Analytics module | Admin / HR shows QoQ achievement trends, completion heatmap, goal distribution, and manager check-in effectiveness. |
| Cost optimization | Architecture uses Vercel + Supabase + optional OpenAI, with server route handlers and no custom infrastructure. |

## Submission Deliverables

- Live demo URL: deploy on Vercel after setting `.env.example` variables.
- Source repository: submit this GitHub/GitLab/Bitbucket repo.
- Architecture diagram: `docs/nexus-architecture.svg`.
- Demo credentials: listed in `README.md`.
