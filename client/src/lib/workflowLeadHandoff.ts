import { normalizeMetaLeadEventId } from "@/lib/metaLeadEvent";

const WORKFLOW_SOURCE_PREFIXES = [
  "playbook_workflow_",
  "direct_intent_workflow_",
];

export function capturedWorkflowLeadEventId(
  source: string | null,
  eventId: string | null,
): string | null {
  if (!source || !WORKFLOW_SOURCE_PREFIXES.some((prefix) => source.startsWith(prefix))) {
    return null;
  }
  return normalizeMetaLeadEventId(eventId);
}
