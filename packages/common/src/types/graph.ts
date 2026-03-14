import { z } from 'zod';

export const KnowledgeNodeType = z.enum([
  'person',
  'project',
  'company',
  'conversation',
  'concept',
  'action_item',
  'habit',
  'health_state',
  'financial_obligation',
  'invoice',
  'repository',
  'decision',
  'risk',
  'opportunity',
  'goal',
  'document',
]);
export type KnowledgeNodeType = z.infer<typeof KnowledgeNodeType>;

export const KnowledgeEdgeType = z.enum([
  'discussed_in',
  'mentioned_in',
  'belongs_to',
  'influences',
  'blocks',
  'supports',
  'related_to',
  'depends_on',
  'created_from',
  'caused_by',
  'paid_with',
  'linked_to_goal',
  'evidence_from',
  'derived_from',
  'works_on',
  'decided_in',
  'followed_by',
  'correlates_with',
]);
export type KnowledgeEdgeType = z.infer<typeof KnowledgeEdgeType>;
