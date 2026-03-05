"use server";

import { adminCreateProduct, adminUpdateProduct, adminDeleteProduct, type ProductFormData } from "../../api/admin.api";
import { revalidatePath } from "next/cache";

function getErrMsg(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    if (typeof r?.data?.message === "string") return r.data.message;
  }
  return "";
}

export const adminCreateProductAction = async (data: Partial<ProductFormData>) => {
  try {
    const res = await adminCreateProduct(data);
    revalidatePath("/admin/products");
    return { success: true, data: res.data.data };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to create product" };
  }
};

export const adminUpdateProductAction = async (id: string, data: Partial<ProductFormData>) => {
  try {
    const res = await adminUpdateProduct(id, data);
    revalidatePath("/admin/products");
    return { success: true, data: res.data.data };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to update product" };
  }
};

export const adminDeleteProductAction = async (id: string) => {
  try {
    await adminDeleteProduct(id);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to delete product" };
  }
};