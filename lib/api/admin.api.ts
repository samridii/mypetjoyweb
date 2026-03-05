import api from "./axios";
import { API } from "./endpoint";
import type { Pet } from "./pets.api";
import type { Product } from "./products.api";
import type { Order, OrderStatus } from "./orders.api";
import type { Adoption, AdoptionStatus } from "./adoptions.api";

export interface Analytics {
  overview: {
    totalUsers: number; totalPets: number; totalProducts: number;
    totalOrders: number; totalAdoptions: number; totalRevenue: number;
  };
  charts: {
    dailyRevenue:     { _id: { year: number; month: number; day: number }; revenue: number }[];
    monthlyRevenue:   { _id: { year: number; month: number }; revenue: number }[];
    topProducts:      { _id: string; totalSold: number }[];
    mostAdoptedPets:  { _id: string; totalAdopted: number }[];
    userGrowth:       { _id: { year: number; month: number }; users: number }[];
  };
}
export const getAnalytics = () =>
  api.get<{ success: boolean; analytics: Analytics }>(API.ANALYTICS);

export type PetFormData = Omit<Pet, "_id" | "createdAt">;
export const adminGetAllPets    = () => api.get<{ success: boolean; data: Pet[] }>(API.ADMIN.PETS.GET_ALL);
export const adminCreatePet     = (data: Partial<PetFormData>) => api.post<{ success: boolean; data: Pet }>(API.ADMIN.PETS.CREATE, data);
export const adminUpdatePet     = (id: string, data: Partial<PetFormData>) => api.put<{ success: boolean; data: Pet }>(API.ADMIN.PETS.UPDATE(id), data);
export const adminDeletePet     = (id: string) => api.delete<{ success: boolean; message: string }>(API.ADMIN.PETS.DELETE(id));

export type ProductFormData = Omit<Product, "_id" | "createdAt">;
export const adminGetAllProducts = () => api.get<{ success: boolean; data: Product[] }>(API.ADMIN.PRODUCTS.GET_ALL);
export const adminCreateProduct  = (data: Partial<ProductFormData>) => api.post<{ success: boolean; data: Product }>(API.ADMIN.PRODUCTS.CREATE, data);
export const adminUpdateProduct  = (id: string, data: Partial<ProductFormData>) => api.put<{ success: boolean; data: Product }>(API.ADMIN.PRODUCTS.UPDATE(id), data);
export const adminDeleteProduct  = (id: string) => api.delete<{ success: boolean; message: string }>(API.ADMIN.PRODUCTS.DELETE(id));

export const adminGetAllOrders    = () => api.get<{ success: boolean; data: Order[] }>(API.ADMIN.ORDERS.GET_ALL);
export const adminUpdateOrderStatus = (id: string, status: OrderStatus) =>
  api.put<{ success: boolean; data: Order }>(API.ADMIN.ORDERS.UPDATE_STATUS(id), { status });

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  isBlocked?: boolean;
  createdAt: string;
}
export const adminGetAllUsers    = () => api.get<{ success: boolean; data: AdminUser[] }>(API.ADMIN.USERS.GET_ALL);
export const adminUpdateUser     = (id: string, data: Partial<AdminUser>) =>
  api.put<{ success: boolean; data: AdminUser }>(API.ADMIN.USERS.UPDATE(id), data);
export const adminDeleteUser     = (id: string) =>
  api.delete<{ success: boolean; message: string }>(API.ADMIN.USERS.DELETE(id));

export const adminGetAllAdoptions = () =>
  api.get<{ success: boolean; data: Adoption[] }>(API.ADMIN.ADOPTIONS.GET_ALL);
export const adminUpdateAdoptionStatus = (id: string, status: AdoptionStatus) =>
  api.put<{ success: boolean; data: Adoption }>(API.ADMIN.ADOPTIONS.UPDATE_STATUS(id), { status });
export const adminUpdateAdoptionStatusWithReason = (id: string, status: AdoptionStatus, rejectionReason?: string) =>
  api.put<{ success: boolean; data: Adoption }>(API.ADMIN.ADOPTIONS.UPDATE_STATUS(id), { status, rejectionReason });