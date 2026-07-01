import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./server";

function isAllowedAdminEmail(email: string | undefined) {
  const allowList = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // 許可リスト未設定の場合は誰でもログイン可能。
  // Supabaseプロジェクトを他アプリと共用していない前提のときのみ、この状態で問題ない。
  if (allowList.length === 0) return true;

  return !!email && allowList.includes(email.toLowerCase());
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowedAdminEmail(user.email)) {
    redirect("/admin/login");
  }

  return user;
}
