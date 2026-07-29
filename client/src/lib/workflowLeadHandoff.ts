import { normalizeMetaLeadEventId } from "@/lib/metaLeadEvent";

const WORKFLOW_SOURCE_PREFIX = "playbook_workflow_";

export function capturedWorkflowLeadEventId(
  source: string | null,
  eventId: string | null,
): string | null {
  if (!source?.startsWith(WORKFLOW_SOURCE_PREFIX)) return null;
  return normalizeMetaLeadEventId(eventId);
}
