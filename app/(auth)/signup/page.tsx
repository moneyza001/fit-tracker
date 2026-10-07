import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>สร้างบัญชี</CardTitle>
        <CardDescription>เริ่มบันทึกเวิร์คเอาท์ของคุณ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-2">
            เข้าสู่ระบบ
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
