# AI Feature Specification Index

**Purpose**: Map the AI capabilities described in [`README.md`](../README.md) to bounded feature specifications.  
**Reviewed**: 2026-06-02  
**Status**: Roadmap coverage complete; implementation planning remains required for roadmap-only specs.

## Specification Set

| Specification | AI Responsibility | Readiness |
| --- | --- | --- |
| [`001-phase1-revenue-workspace`](./001-phase1-revenue-workspace/spec.md) | Supervised campaign planning, editable social and email drafts, risk flags, approvals, and follow-up suggestions | Has plan, data model, and tasks |
| [`002-subscription-credit-jobs`](./002-subscription-credit-jobs/spec.md) | Paid AI usage, model pricing, wallets, reservations, background jobs, retries, settlement, rate limits, and safe operational views | Has plan, data model, contracts, and tasks |
| [`003-phase2-automation-scheduling`](./003-phase2-automation-scheduling/spec.md) | Explainable lead scoring, task suggestions, measured campaign activity, and approved external execution | Roadmap spec only |
| [`004-phase3-agentic-ai-system`](./004-phase3-agentic-ai-system/spec.md) | Supervisor-led multi-agent orchestration, specialist handoffs, agent policy, activity log, pipeline coach, campaign optimization, and quality metrics | Roadmap spec only |
| [`005-phase4-agency-team-features`](./005-phase4-agency-team-features/spec.md) | Client-specific AI context isolation, approval behavior, and generated client reports | Roadmap spec only |
| [`006-phase5-revenue-intelligence`](./006-phase5-revenue-intelligence/spec.md) | Forecasts, attribution, deal risk, churn signals, retention workflows, growth plans, and privacy-safe benchmarks | Roadmap spec only |
| [`007-supervised-ai-assistants`](./007-supervised-ai-assistants/spec.md) | Detailed user-invoked AI assistance for onboarding, CRM, sales, content, email, and research | Roadmap spec only |
| [`008-unified-inbox-intelligence`](./008-unified-inbox-intelligence/spec.md) | Inbox ingestion, conversation intelligence, reply drafting, human-approved replies, CRM conversion, assignment, and inbox reporting | Roadmap spec only |

## README Capability Coverage

| README Area | Covered Capabilities | Owning Specification |
| --- | --- | --- |
| Onboarding | Brand profile, ideal customer profile, content pillars, basic pipeline, suggested sequences, suggested workflows, AI preference boundaries | [`001`](./001-phase1-revenue-workspace/spec.md), [`007`](./007-supervised-ai-assistants/spec.md) |
| CRM AI | Contact-history summaries, next actions, lead temperature, personalized drafts, segment suggestions, contact-detail extraction | [`007`](./007-supervised-ai-assistants/spec.md) |
| Pipeline AI | Pipeline summaries, deals requiring attention, follow-up suggestions, lost-deal analysis, proposal outlines, next actions, call preparation | [`007`](./007-supervised-ai-assistants/spec.md), [`004`](./004-phase3-agentic-ai-system/spec.md), [`006`](./006-phase5-revenue-intelligence/spec.md) |
| Social content AI | Content calendars, offer-based posts, repurposing, brand-voice rewrites, hooks, calls to action, hashtags, posting guidance, top-performing pattern analysis, performance-backed ideas | [`007`](./007-supervised-ai-assistants/spec.md), [`003`](./003-phase2-automation-scheduling/spec.md) |
| Email AI | Sequence drafts, personalization, subject-line improvements, spam-risk findings, follow-up timing, reply summaries, intent classification, response drafts, campaign improvements | [`007`](./007-supervised-ai-assistants/spec.md), [`004`](./004-phase3-agentic-ai-system/spec.md) |
| Unified inbox AI | Conversation summaries, buying intent, complaint risk, reply drafts, message-to-contact, message-to-deal, message-to-task, assignment | [`008`](./008-unified-inbox-intelligence/spec.md) |
| Agentic AI layer | Strategy, content, email, CRM, sales, research, analytics, automation-suggestion, compliance, and supervisor responsibilities | [`004`](./004-phase3-agentic-ai-system/spec.md), [`007`](./007-supervised-ai-assistants/spec.md) |
| Campaign workflow | Campaign angle, content calendar, social drafts, email sequence, landing-page suggestions, follow-up tasks, approval checkpoints | [`001`](./001-phase1-revenue-workspace/spec.md), [`007`](./007-supervised-ai-assistants/spec.md), [`004`](./004-phase3-agentic-ai-system/spec.md) |
| Lead qualification workflow | Lead scoring, segmentation, next actions, first follow-up draft, user approval | [`003`](./003-phase2-automation-scheduling/spec.md), [`007`](./007-supervised-ai-assistants/spec.md) |
| Pipeline coach workflow | Stale deals, high-value opportunities, missing follow-ups, priorities, drafts, accept-or-dismiss controls | [`004`](./004-phase3-agentic-ai-system/spec.md) |
| Content repurposing workflow | Channel-specific social, newsletter, short-video, and carousel drafts from one approved idea | [`007`](./007-supervised-ai-assistants/spec.md) |
| Revenue insights workflow | Priorities, risky deals, campaign insights, bottlenecks, growth actions, forecasts, retention, benchmarks | [`004`](./004-phase3-agentic-ai-system/spec.md), [`006`](./006-phase5-revenue-intelligence/spec.md) |
| AI safety and trust | Editable drafts, restorable prior versions, approval queue, auditability, policy boundaries, confidence or uncertainty, context visibility, prohibited automatic actions | [`001`](./001-phase1-revenue-workspace/spec.md), [`004`](./004-phase3-agentic-ai-system/spec.md), [`007`](./007-supervised-ai-assistants/spec.md), [`008`](./008-unified-inbox-intelligence/spec.md) |
| AI analytics | Task outcomes, approvals, overrides, regeneration, failures, completion, traceability, time-saved estimates | [`004`](./004-phase3-agentic-ai-system/spec.md), [`002`](./002-subscription-credit-jobs/spec.md) |

## Planning Order

1. Complete the remaining Phase 1 campaign-draft slice and the `002` paid-job foundation.
2. Plan the reusable assistant capabilities in `007` as small vertical slices.
3. Plan Phase 2 delivery, lead-scoring, and performance dependencies needed by posting guidance and inbox replies.
4. Plan `008` unified inbox ingestion and supervised reply workflows.
5. Plan Phase 3 orchestration after the reusable specialist capabilities and trust controls are reliable.
6. Preserve Phase 4 and Phase 5 as later roadmap work until their dependencies are production-ready.

## Boundary Notes

- `007` defines reusable user-invoked AI assistance. It does not introduce autonomous or multi-step agent orchestration.
- `008` defines the inbox communication lifecycle and its AI assistance. It reuses delivery controls rather than bypassing them.
- `004` composes supported specialist capabilities into supervised agent runs after the smaller slices are reliable.
- All protected actions remain subject to workspace scope, current policy checks, explicit human control, audit history, and predictable recovery.
