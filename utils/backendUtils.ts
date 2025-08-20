import { APIRequestContext, expect } from "@playwright/test";

export class BackendUtils {
    static async createUserViaAPI(request: APIRequestContext, user: any) {

        const email = (user.email.split('@'))[0] + Math.floor(Math.random() * 1000) + '@' + (user.email.split('@')[1]); 
        const response = await request.post('http://localhost:6007/api/auth/signup', {
          headers: { 'Content-Type': 'application/json' },
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: email,
            password: user.password,
          },
        });
      
        const responseBody = await response.json();
        expect(response.status()).toBe(201);
        return {email: email, password: user.password}

}
}