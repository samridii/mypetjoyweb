"use server";
// lib/actions/admin/user-action.ts
import { adminGetAllUsers, adminUpdateUser, adminDeleteUser } from "../../api/admin.api";
import { revalidatePath } from "next/cache";

function getErrMsg(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    if (typeof r?.data?.message === "string") return r.data.message;
  }
  return "";
}

export const adminGetAllUsersAction = async () => {
  try {
    const res = await adminGetAllUsers();
    return { success: true, data: res.data.data };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to fetch users" };
  }
};

export const adminUpdateUserAction = async (id: string, data: Record<string, unknown>) => {
  try {
    const res = await adminUpdateUser(id, data);
    revalidatePath("/admin/users");
    return { success: true, data: res.data.data };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to update user" };
  }
};

export const adminDeleteUserAction = async (id: string) => {
  try {
    await adminDeleteUser(id);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to delete user" };
  }
};