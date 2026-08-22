import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { connectToDatabase } from "@/lib/db";
import { BodyWeight } from "@/models";
import { toPlainJSON } from "@/lib/serialize";
import { requireUserId } from "@/lib/auth-guard";
import type { BodyWeightRow } from "@/types";
import { BodyWeightTab } from "@/components/body-weight/body-weight-tab";

export const dynamic = "force-dynamic";

export default async function BodyWeightPage() {
  await connectToDatabase();
  const userId = await requireUserId();

  const entriesDoc = await BodyWeight.find({ userId }).sort({
    date: 1,
  });
  const entries = toPlainJSON<BodyWeightRow[]>(entriesDoc);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Body Weight</h1>
        <p className="text-sm text-muted-foreground">
          Log and track your body weight over time.
        </p>
      </div>

      <BodyWeightTab initialEntries={entries} />
    </div>
  );
}
