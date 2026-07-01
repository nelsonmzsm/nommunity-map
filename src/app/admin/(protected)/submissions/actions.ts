"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function approveSubmission(id: string) {
  const user = await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("approve_submission", {
    submission_id: id,
    reviewer_id: user.id,
  });
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/stores");
  redirect("/admin/submissions");
}

export async function rejectSubmission(id: string, adminNote: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("store_submissions")
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), admin_note: adminNote })
    .eq("id", id);
  revalidatePath("/admin/submissions");
  redirect("/admin/submissions");
}
