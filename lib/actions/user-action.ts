"use server";
// lib/actions/user-action.ts
import { updateProfile, changePassword, type UpdateProfileData, type ChangePasswordData } from "../api/user.api";

function getErrMsg(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    if (typeof r?.data?.message === "string") return r.data.message;
  }
  return "";
}

export const updateProfileAction = async (data: UpdateProfileData) => {
  try {
    const res = await updateProfile(data);
    return { success: true, message: res.data.message, user: res.data.user };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to update profile" };
  }
};

export const changePasswordAction = async (data: ChangePasswordData) => {
  try {
    const res = await changePassword(data);
    return { success: true, message: res.data.message };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to change password" };
  }
};