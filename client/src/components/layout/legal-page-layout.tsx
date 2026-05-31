import type { ReactNode } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function LegalPageLayout({
  eyebrow,
  title,
  description,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-br from-emerald-50 via-white to-amber-50">
          <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {eyebrow}
              </p>
              <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                {description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <Link href="/" className="font-medium text-slate-700 underline underline-offset-4">
                  Back to PestFlow
                </Link>
                <span>Reflectly AI, Inc. is the Texas-based company behind PestFlow.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="prose prose-slate max-w-3xl prose-headings:font-heading prose-headings:text-slate-950 prose-p:text-slate-700 prose-li:text-slate-700">
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
