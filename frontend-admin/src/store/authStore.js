import { getMeRequest, loginRequest } from "../services/authService";
import {
  clearSessionStorage,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
} from "../utils/storage";

class AuthStore {
  constructor() {
    this.user = getStoredUser();
    this.token = getAccessToken();
  }

  isAuthenticated() {
    return Boolean(this.token);
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  async login(email, password) {
    const data = await loginRequest({ email, password });

    const token = data?.data?.token;
    const user = data?.data?.user;

    if (!token || !user) {
      throw new Error("Respuesta de login inválida.");
    }

    this.token = token;
    this.user = user;

    setAccessToken(token);
    setStoredUser(user);

    return user;
  }

  async refreshMe() {
    const data = await getMeRequest();
    const user = data?.data;

    if (!user) {
      throw new Error("No se pudo obtener el usuario autenticado.");
    }

    this.user = user;
    setStoredUser(user);

    return user;
  }

  logout() {
    this.user = null;
    this.token = null;
    clearSessionStorage();
  }
}

const authStore = new AuthStore();

export default authStore;