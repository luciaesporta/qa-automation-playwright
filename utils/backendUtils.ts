import { APIRequestContext, expect } from "@playwright/test";
import { PageSignUp } from "../pages/pageSignUp";

export class BackendUtils {
  static async createUserViaAPI(request: APIRequestContext, user: any) {
    const email = PageSignUp.generateUniqueEmail(user.email);

    const response = await request.post("http://localhost:6007/api/auth/signup", {
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
