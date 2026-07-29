import { useEffect } from "react";
import { Loader2 } from "lucide-react";

type WorkflowId = "recurring" | "invoice" | "schedule";

function workflowFromUrl(): WorkflowId {
  const requested = new URLSearchParams(window.location.search).get("workflow");
  if (
    requested === "recurring" ||
    requested === "invoice" ||
    requested === "schedule"
  ) {
    return requested;
  }
  return "recurring";
}

export default function PestFlowWorkflowPreview() {
  useEffect(() => {
    const current = new URLSearchParams(window.location.search);
    const workflow = workflowFromUrl();
    const next = new URLSearchParams({
      source: `playbook_workflow_${workflow}`,
      intent: workflow,
    });
    ["internal", "revision", "utm_source", "utm_campaign", "utm_content"].forEach(
      (key) => {
        const value = current.get(key);
        if (value) next.set(key, value);
      },
    );
    next.set("handoff", "app_store");
    window.location.replace(`/signup-success?${next.toString()}`);
  }, []);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 p-6">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
        <p className="mt-3 text-sm font-semibold text-slate-600">
          Opening PestFlow…
        </p>
      </div>
    </main>
  );
}
