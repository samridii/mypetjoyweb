"use server";
// lib/actions/admin/adoptions-action.ts
import { adminUpdateAdoptionStatus } from "../../api/admin.api";
import type { AdoptionStatus } from "../../api/adoptions.api";
import { revalidatePath } from "next/cache";

function getErrMsg(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    if (typeof r?.data?.message === "string") return r.data.message;
  }
  return "";
}

export const adminUpdateAdoptionStatusAction = async (
  id: string,
  status: AdoptionStatus
) => {
  try {
    const res = await adminUpdateAdoptionStatus(id, status);
    revalidatePath("/admin/adoptions");
    const payload = (res.data as { data?: unknown })?.data ?? res.data ?? null;
    return { success: true, data: payload };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to update adoption status" };
  }
};