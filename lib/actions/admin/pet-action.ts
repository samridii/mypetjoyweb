"use server";
// lib/actions/admin/pets-action.ts
import { adminCreatePet, adminUpdatePet, adminDeletePet, type PetFormData } from "../../api/admin.api";
import { revalidatePath } from "next/cache";

function getErrMsg(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    if (typeof r?.data?.message === "string") return r.data.message;
  }
  return "";
}

export const adminCreatePetAction = async (data: Partial<PetFormData>) => {
  try {
    const res = await adminCreatePet(data);
    revalidatePath("/admin/pets");
    return { success: true, data: res.data.data };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to create pet" };
  }
};

export const adminUpdatePetAction = async (id: string, data: Partial<PetFormData>) => {
  try {
    const res = await adminUpdatePet(id, data);
    revalidatePath("/admin/pets");
    return { success: true, data: res.data.data };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to update pet" };
  }
};

export const adminDeletePetAction = async (id: string) => {
  try {
    await adminDeletePet(id);
    revalidatePath("/admin/pets");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to delete pet" };
  }
};