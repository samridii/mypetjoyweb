// lib/api/pets.api.ts
import api from "./axios";
import { API } from "./endpoint";

export interface Pet {
  _id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  description: string;
  image: string;
  status: "AVAILABLE" | "PENDING" | "ADOPTED";
  yearlyFoodCost?: number;
  yearlyMedicalCost?: number;
  yearlyGroomingCost?: number;
  averageLifespan?: number;
  createdAt: string;
}

export interface PetCost {
  petName: string;
  yearlyBreakdown: {
    food: number;
    medical: number;
    grooming: number;
    totalPerYear: number;
  };
  lifespanYears: number;
  estimatedLifetimeCost: number;
}

export const getAllPets       = () => api.get<{ success: boolean; data: Pet[] }>(API.PETS.GET_ALL);
export const getPetById       = (id: string) => api.get<{ success: boolean; data: Pet }>(API.PETS.GET_BY_ID(id));
export const getPetCost       = (id: string) => api.get<{ success: boolean; costDetails: PetCost }>(API.PETS.COST(id));