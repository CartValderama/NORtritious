import httpClient, { setAuthToken, clearAuthToken } from "./httpClient";

export interface UserInfo {
  email: string;
  name: string;
  role: string;
  organizationNumber: string;
  profilePicture: string;
}

export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await httpClient.get("/api/account/get-user-info");
  return response.data;
};

export const login = async (email: string, password: string): Promise<void> => {
  const response = await httpClient.post("/api/account/login", { email, password });
  setAuthToken(response.data.token);
};

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  organizationNumber: string;
}

export const register = async (request: RegisterRequest): Promise<void> => {
  await httpClient.post("/api/account/register", request);
};

export const logout = async (): Promise<void> => {
  try {
    await httpClient.post("/api/account/logout", {});
  } finally {
    clearAuthToken();
  }
};

export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export const changePassword = async (
  request: ChangePasswordRequest,
): Promise<void> => {
  await httpClient.post("/api/account/change-password", request);
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
  await httpClient.put("/api/account/update-user-info", request);
};

export const uploadProfilePicture = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await httpClient.post("/api/account/upload-profile-picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
