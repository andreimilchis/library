import { z } from 'zod';

export const InsightType = z.enum([
  'realtime_alert',
  'daily_digest',
  'weekly_review',
  'monthly_review',
  'recommendation',
  'strategic_note',
  'risk_alert',
  'execution_map',
  'contradiction_alert',
  'inconsistency_alert',
  'anomaly',
  'pattern',
]);
export type InsightType = z.infer<typeof InsightType>;

export const InsightStatus = z.enum([
  'generated',
  'delivered',
  'read',
  'actioned',
  'dismissed',
  'expired',
]);
export type InsightStatus = z.infer<typeof InsightStatus>;

export const InsightSeverity = z.enum(['low', 'medium', 'high', 'critical']);
export type InsightSeverity = z.infer<typeof InsightSeverity>;

export const AgentType = z.enum([
  'daily_briefing',
  'weekly_review',
  'execution_planner',
  'focus_coach',
  'financial_watch',
  'health_pattern',
  'memory_librarian',
  'graph_curator',
  'inbox_synthesizer',
  'github_progress',
]);
export type AgentType = z.infer<typeof AgentType>;

export const AgentRunStatus = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
]);
export type AgentRunStatus = z.infer<typeof AgentRunStatus>;

export const ApprovalStatus = z.enum(['pending', 'approved', 'rejected', 'expired']);
export type ApprovalStatus = z.infer<typeof ApprovalStatus>;
