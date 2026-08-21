import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>FitTracker</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Phase 1 foundation is ready — Next.js, Tailwind, shadcn/ui, and
          Mongoose are wired up. Pages land in later phases.
        </CardContent>
      </Card>
    </div>
  );
}
