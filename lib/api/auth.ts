import { UserData } from '../cookie';
import api from './axios';
import { API } from './endpoint';


interface RegisterData {
  email: string;
  password: string;
  role?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user?: UserData;
}

export interface LoginResponse {
  token: string;
  user: UserData;
}

export const registerUser = (data: RegisterData) => {
  return api.post<RegisterResponse>(API.AUTH.REGISTER, data); 
};

export const loginUser = (data: LoginData) => {
  return api.post<LoginResponse>(API.AUTH.LOGIN, data); 
};