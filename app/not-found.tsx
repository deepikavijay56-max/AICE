import Link from "next/link";
import { ShieldCheckIcon, AlertCircleIcon } from "@/components/admin/Icons";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <AlertCircleIcon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The statutory approval resource, case dossier, or portal route you requested does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Return to AICTE SAKSHAM Home</span>
          </Link>
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Go to Portal Sign In
          </Link>
        </div>

        <div className="text-[11px] font-mono text-slate-600 border-t border-slate-100 pt-4">
          HTTP 404 &bull; AICTE SAKSHAM Compliance Router
        </div>
      </div>
    </div>
  );
}
