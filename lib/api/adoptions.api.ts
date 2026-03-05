// lib/api/adoptions.api.ts
import api from "./axios";
import { API } from "./endpoint";

export type AdoptionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdoptionRequest {
  pet: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  livingType: string;
  hasOtherPets: boolean;
  experience: string;
  reason: string;
}

export interface Adoption extends AdoptionRequest {
  _id: string;
  user: string;
  status: AdoptionStatus;
  createdAt: string;
}

export const requestAdoption = (data: AdoptionRequest) =>
  api.post<{ success: boolean; message: string; data: Adoption }>(API.ADOPTIONS.REQUEST, data);