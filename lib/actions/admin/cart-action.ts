"use server";

import { addToCart, removeFromCart, clearCart } from "../../api/cart.api";
import { revalidatePath } from "next/cache";

function getErrMsg(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    if (typeof r?.data?.message === "string") return r.data.message;
  }
  return "";
}

export const addToCartAction = async (productId: string, quantity: number) => {
  try {
    const res = await addToCart(productId, quantity);
    revalidatePath("/cart");
    return { success: true, data: res.data.data };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to add to cart" };
  }
};
export const removeFromCartAction = async (productId: string) => {
  try {
    const res = await removeFromCart(productId);
    revalidatePath("/cart");
    return { success: true, data: res.data.data };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to remove from cart" };
  }
};
export const clearCartAction = async () => {
  try {
    const res = await clearCart();
    revalidatePath("/cart");
    return { success: true, message: res.data.message };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to clear cart" };
  }
};