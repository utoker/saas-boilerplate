import Link from "next/link";
import type { Metadata } from "next";
import { FadeInOnScroll } from "@/components/fade-in-on-scroll";

export const metadata: Metadata = {
  title: "LaunchKit — Ship Your SaaS in Days, Not Months",
  description:
    "Production-ready SaaS boilerplate with authentication, billing, AI chat, and more. Built with Next.js 16, Supabase, Stripe, and Claude.",
};

interface Feature {
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
}

const features: Feature[] = [
  {
    name: "AI Chat",
    description:
      "Built-in AI chat powered by Claude with streaming responses, conversation history, and usage tracking.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    name: "Authentication",
    description:
      "Supabase auth with email/password and Google OAuth. User profiles, session management, and protected routes included.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    name: "Stripe Billing",
    description:
      "Subscription management with free and pro tiers, Stripe Checkout, customer portal, and webhook handling.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    name: "Next.js 16",
    description:
      "App Router, server components, server actions, TypeScript strict mode, and Tailwind CSS v4. Production-ready from day one.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to get started.",
    features: [
      "100 AI messages per month",
      "Email authentication",
      "Basic dashboard",
      "Community support",
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For power users who need more.",
    features: [
      "Unlimited AI messages",
      "Google OAuth",
      "Priority support",
      "Full API access",
      "Advanced analytics",
    ],
    cta: "Upgrade to Pro",
    href: "/signup",
    highlighted: true,
  },
];

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      className="shrink-0 text-blue-600 dark:text-blue-400"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            LaunchKit
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-24 lg:py-32 dark:bg-[radial-gradient(ellipse_80%_70%_at_50%_40%,#18181b,#000000)]">
        <div
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          }}
          className="pointer-events-none absolute inset-0 opacity-60"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,rgba(139,92,246,0.08),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,rgba(139,92,246,0.1),transparent)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="mx-auto max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Ship your SaaS in days, not months
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
            Authentication, billing, AI chat, and a polished dashboard — all
            pre-built and ready to customize. Stop rebuilding the basics and
            start shipping what matters.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="rounded-lg border border-zinc-300 px-8 py-3 text-base font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              View Demo
            </a>
          </div>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-400 dark:text-zinc-500">
            <span>Built with</span>
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400">
                <path d="M6 2l12 18H6z" />
              </svg>
              <span className="font-medium text-zinc-600 dark:text-zinc-300">Next.js</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
              </svg>
              <span className="font-medium text-zinc-600 dark:text-zinc-300">Supabase</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <span className="font-medium text-zinc-600 dark:text-zinc-300">Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
                <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
              </svg>
              <span className="font-medium text-zinc-600 dark:text-zinc-300">Claude AI</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span className="font-medium text-zinc-600 dark:text-zinc-300">TypeScript</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-zinc-200 bg-zinc-50 px-6 py-24 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need to launch
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Stop wiring up auth, payments, and infrastructure. LaunchKit gives
              you a production-ready foundation so you can focus on your product.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <FadeInOnScroll key={feature.name} delay={i * 75}>
                <div className="h-full rounded-xl border border-zinc-200 bg-white p-6 transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] dark:border-zinc-800 dark:bg-zinc-950 dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.name}</h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Everything you need to know before you start building.
            </p>
          </div>
          <div className="mt-16 space-y-4">
            <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800">
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-medium">
                What&apos;s included in LaunchKit?
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm text-zinc-600 dark:text-zinc-400">
                Authentication with email and Google OAuth, Stripe billing with
                free and pro tiers, an AI-powered chat interface, a polished
                dashboard with usage analytics, and a fully responsive landing
                page. Everything is pre-wired and deployment-ready.
              </div>
            </details>

            <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800">
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-medium">
                What tech stack does this use?
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm text-zinc-600 dark:text-zinc-400">
                Next.js 16 with the App Router and React Server Components,
                Supabase for authentication and database, Stripe for payments,
                the Vercel AI SDK with Claude for the chat feature, TypeScript in
                strict mode, and Tailwind CSS v4 for styling.
              </div>
            </details>

            <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800">
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-medium">
                Can I customize everything?
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm text-zinc-600 dark:text-zinc-400">
                Absolutely. You own the source code — there&apos;s no vendor
                lock-in or proprietary framework. Swap out providers, restyle
                components, add features, or strip out what you don&apos;t need.
                It&apos;s your codebase to shape however you want.
              </div>
            </details>

            <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800">
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-medium">
                How does the AI chat work?
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm text-zinc-600 dark:text-zinc-400">
                The chat connects to Claude through the Vercel AI SDK. Messages
                stream in real-time, conversations are saved to your Supabase
                database, and per-user usage is tracked automatically. The free
                tier includes 100 messages per month with unlimited on Pro.
              </div>
            </details>

            <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800">
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-medium">
                How is billing handled?
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm text-zinc-600 dark:text-zinc-400">
                Stripe handles everything — checkout sessions, subscription
                management, and webhooks are all pre-configured. Users can
                upgrade, downgrade, or cancel through the Stripe Customer Portal.
                Free and Pro tiers work out of the box.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-zinc-200 px-6 py-24 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Start free and upgrade when you&apos;re ready. No hidden fees, no
              surprises.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
            {tiers.map((tier, i) => {
              const cardContent = (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                    {tier.highlighted && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {tier.description}
                  </p>
                  <div className="mt-6">
                    <span className="text-4xl font-semibold">{tier.price}</span>
                    <span className="text-sm text-zinc-500">
                      {tier.period}
                    </span>
                  </div>
                  <ul className="mt-8 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckIcon />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={tier.href}
                    className={`mt-8 block rounded-lg px-6 py-3 text-center text-sm font-medium ${
                      tier.highlighted
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </>
              );

              if (tier.highlighted) {
                return (
                  <FadeInOnScroll key={tier.name} delay={i * 100}>
                    <div className="relative rounded-xl p-px">
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, #3b82f6, #8b5cf6, #3b82f6, #8b5cf6)",
                          backgroundSize: "300% 300%",
                          animation: "gradient-border 4s ease infinite",
                        }}
                      />
                      <div className="relative rounded-xl bg-white p-8 dark:bg-zinc-950">
                        {cardContent}
                      </div>
                    </div>
                  </FadeInOnScroll>
                );
              }

              return (
                <FadeInOnScroll key={tier.name} delay={i * 100}>
                  <div className="h-full rounded-xl border border-zinc-200 p-8 dark:border-zinc-800">
                    {cardContent}
                  </div>
                </FadeInOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 px-6 py-12 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-zinc-500">
            &copy; 2026 LaunchKit. All rights reserved.
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Built by{" "}
            <a
              href="https://utoker.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Umut Toker
            </a>
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
