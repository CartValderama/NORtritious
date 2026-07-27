import axios from "axios";
import API_URL from "../apiConfig";

export interface UserInfo {
  email: string;
  name: string;
  role: string;
  organizationNumber: string;
  profilePicture: string;
}

export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await axios.get(`${API_URL}/api/account/get-user-info`, {
    withCredentials: true,
  });
  return response.data;
};

export const login = async (email: string, password: string): Promise<void> => {
  await axios.post(
    `${API_URL}/api/account/login`,
    { email, password },
    { withCredentials: true },
  );
};

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  organizationNumber: string;
}

export const register = async (request: RegisterRequest): Promise<void> => {
  await axios.post(`${API_URL}/api/account/register`, request, {
    withCredentials: true,
  });
};

export const logout = async (): Promise<void> => {
  await axios.post(
    `${API_URL}/api/account/logout`,
    {},
    { withCredentials: true },
  );
};

export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export const changePassword = async (
  request: ChangePasswordRequest,
): Promise<void> => {
  await axios.post(`${API_URL}/api/account/change-password`, request, {
    withCredentials: true,
  });
};

export interface UpdateUserInfoRequest {
  email: string;
  name: string;
  role: string;
  organizationNumber: string;
}

export const updateUserInfo = async (
  request: UpdateUserInfoRequest,
): Promise<void> => {
  await axios.put(`${API_URL}/api/account/update-user-info`, request, {
    withCredentials: true,
  });
};

export const uploadProfilePicture = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await axios.post(`${API_URL}/api/account/upload-profile-picture`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
};
