import api from "./axios";
import { API } from "./endpoint";

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItem { product: { _id: string; name: string; price: number; image: string }; quantity: number; }
export interface Order {
  _id: string;
  user: string;
  products: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface PlaceOrderItem { productId: string; quantity: number; }

export const placeOrder   = (items: PlaceOrderItem[]) =>
  api.post<{ success: boolean; message: string; data: Order }>(API.ORDERS.PLACE, { items });
export const getMyOrders  = () =>
  api.get<{ success: boolean; data: Order[] }>(API.ORDERS.MY_ORDERS);