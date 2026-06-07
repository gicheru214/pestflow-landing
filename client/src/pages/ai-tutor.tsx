import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, LogIn, MessageCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

type Choice = "yes" | "no" | "signin" | null;

const responses = {
  yes: "You are in the right place. Start with labels, safety, application math, IPM, and recordkeeping.",
  no: "All good. You can come back when licensing prep matters.",
  signin: "Sign in to continue.",
};

export default function AiTutorPage() {
  const [choice, setChoice] = useState<Choice>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <main className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-slate-900/15 sm:p-6">
          <div className="rounded-[1.5rem] bg-white p-5 sm:p-8">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">AI Tutor</h1>
                <p className="text-sm font-medium text-slate-500">Licensing exam check-in</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="max-w-[90%] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base leading-relaxed text-slate-700">
                Are you studying for your pest control licensing exam?
              </div>

              {choice && (
                <>
                  <div className="ml-auto max-w-[90%] rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white">
                    {choice === "yes" ? "Yes" : choice === "no" ? "No" : "Sign in"}
                  </div>
                  <div className="max-w-[90%] rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base leading-relaxed text-emerald-900">
                    {responses[choice]}
                  </div>
                </>
              )}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Button onClick={() => setChoice("yes")} className="h-12 bg-emerald-600 text-base font-bold text-white hover:bg-emerald-500">
                Yes
              </Button>
              <Button onClick={() => setChoice("no")} variant="outline" className="h-12 text-base font-bold">
                <XCircle className="mr-2 h-4 w-4" />
                No
              </Button>
              <Button onClick={() => setChoice("signin")} variant="outline" className="h-12 text-base font-bold">
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Button>
            </div>

            {choice === "signin" && (
              <Link href="/login" className="mt-4 block">
                <Button className="h-12 w-full bg-slate-900 text-base font-bold text-white hover:bg-slate-800">
                  Continue to sign in <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
