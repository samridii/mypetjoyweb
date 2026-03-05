import api from "./axios";
import { API } from "./endpoint";
import type { Product } from "./products.api";

export interface CartItem { product: Product; quantity: number; }
export interface Cart { _id: string; user: string; items: CartItem[]; }

export const getCart        = () => api.get<{ success: boolean; data: Cart }>(API.CART.GET);
export const addToCart      = (productId: string, quantity: number) =>
  api.post<{ success: boolean; data: Cart }>(API.CART.ADD, { productId, quantity });
export const removeFromCart = (productId: string) =>
  api.delete<{ success: boolean; data: Cart }>(API.CART.REMOVE(productId));
export const clearCart      = () => api.delete<{ success: boolean; message: string }>(API.CART.CLEAR);