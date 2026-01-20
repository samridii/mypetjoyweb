import { loginUser, registerUser } from "../api/auth";
import { clearAuthCookies, getAuthToken, getUserData, setAuthToken, setUserData, UserData } from "../cookie";

export interface RegisterData {
  email: string;
  password: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
interface LoginResponse {
  token: string;
  user: UserData;
}
interface RegisterResponse {
  message: string;
  user?: UserData;
}

export interface LoginResult {
  success: boolean;
  user?: UserData;
  token?: string;
  message?: string;
}

export interface RegisterResult {
  success: boolean;
  message: string;
  user?: UserData;
}

export const registerAction = async (data: RegisterData): Promise<RegisterResult> => {
  try {
    const res = await registerUser(data);
    const responseData: RegisterResponse = res.data;

    return {
      success: true,
      message: responseData.message || "Registration successful",
      user: responseData.user,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Registration failed",
    };
  }
};

export const loginAction = async (data: LoginData): Promise<LoginResult> => {
  try {
    const res = await loginUser(data);
    const responseData: LoginResponse = res.data;

    const { token, user } = responseData;

    await setAuthToken(token);
    await setUserData(user);

    return { success: true, user, token };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Login failed",
    };
  }
};

export const logoutAction = async () => {
  await clearAuthCookies();
};

export const getLoggedInUser = async () => {
  const token = await getAuthToken();
  const user = await getUserData();
  return { token, user };
};