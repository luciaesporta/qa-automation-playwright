import { APIRequestContext, expect } from "@playwright/test";
import { PageSignUp } from "../pages/pageSignUp";
import { ConfigHelpers, API_ENDPOINTS } from "../config/environment";

export class BackendUtils {
  static async createUserViaAPI(request: APIRequestContext, user: any) {
    const email = PageSignUp.generateUniqueEmail(user.email);

    const response = await request.post(ConfigHelpers.getApiEndpoint(API_ENDPOINTS.AUTH.SIGNUP), {
      headers: { "Content-Type": "application/json" },
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: email,
        password: user.password,
      },
    });

    const responseBody = await response.json();
    expect(response.status()).toBe(201);

    return { email, password: user.password };
  }
}
