import type { Metadata } from "next";
import { Doc } from "@/components/Icons";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  return (
    <section>
      <p className="eyebrow">Your paperwork</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Documents</h1>
      <div className="panel mt-6 max-w-2xl">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sand/50 text-terra"><Doc width={22} height={22} /></span>
        <h2 className="mt-4 text-xl">Secure document sharing is not enabled yet</h2>
        <p className="mt-2 text-sm leading-6 text-mute">No files are stored in your dashboard. Your agent can explain which documents you need and arrange a secure sharing method. Do not send sensitive identity documents through public links.</p>
      </div>
    </section>
  );
}
