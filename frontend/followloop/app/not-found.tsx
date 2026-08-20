import Link from "next/link";
import Mascot from "@/components/landing/Mascot";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="mb-6 h-28 w-28">
        <Mascot />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        This page went cold.
      </h1>
      <p className="mt-3 max-w-sm text-ink-muted">
        We couldn&rsquo;t find what you were looking for. Let&rsquo;s get you
        back to a warmer lead.
      </p>
      <Link href="/" className="btn-accent mt-8 px-6 py-3">
        Back to home
      </Link>
    </div>
  );
}
