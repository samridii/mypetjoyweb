"use server";
// lib/actions/orders-action.ts
import { placeOrder, type PlaceOrderItem } from "../../api/orders.api";
import { revalidatePath } from "next/cache";

function getErrMsg(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    if (typeof r?.data?.message === "string") return r.data.message;
  }
  return "";
}

export const placeOrderAction = async (items: PlaceOrderItem[]) => {
  try {
    const res = await placeOrder(items);
    revalidatePath("/orders");
    return { success: true, message: res.data.message, data: res.data.data };
  } catch (err: unknown) {
    return { success: false, message: getErrMsg(err) || "Failed to place order" };
  }
};