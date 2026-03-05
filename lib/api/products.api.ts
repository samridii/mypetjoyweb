import api from "./axios";
import { API } from "./endpoint";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  createdAt: string;
}

export const getAllProducts  = () => api.get<{ success: boolean; data: Product[] }>(API.PRODUCTS.GET_ALL);
export const getProductById  = (id: string) => api.get<{ success: boolean; data: Product }>(API.PRODUCTS.GET_BY_ID(id));