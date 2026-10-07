import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>เข้าสู่ระบบ</CardTitle>
        <CardDescription>ยินดีต้อนรับกลับสู่ FitTracker</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link href="/signup" className="font-medium text-foreground underline underline-offset-2">
            สมัครสมาชิก
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
