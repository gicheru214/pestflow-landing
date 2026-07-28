import { useEffect } from "react";

export default function AppStoreSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("handoff", "app_store");
    if (!params.has("source")) params.set("source", "mobile_banner");
    window.location.replace(`/signup-success?${params.toString()}`);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 text-center text-slate-600">
      Opening the PestFlow success page…
    </main>
  );
}
