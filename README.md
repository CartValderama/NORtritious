# Bachelor Prosjekt

This is the Bachelor project of:

- Kjell Wiggo Abrahamsen (s374924)
- Mats August Schmid Olsen (s360784)
- Harald Hammershaug (s374171)
- Gunnar Larsson (s375150)

## 1 Backend

Can be run in production mode or in developer mode with `dotnet run dev`, in which mode the Swagger API explorer is available at `http://localhost:port/Swagger/index.html`.

The backend contains:

- Entity Framework with SQLite Migrations and Identity set up.
- Identity is set up with role and admin user seeding.
- Logger for error handling.
- DAL with Interface Repository, Repository and DbContext.
- DTO folder for React transfer objects.
- Account controller containing a basic login test method.
- Swagger for API exploring.

## 2 Frontend

Contains an out-of-the-box React application which has yet to be developed.

## 3 API

`AccountController` -> `Login` can be tested using the the seeded Admin json:

```
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

## 4 Login Session

In the current repository `ApplicationRepository`, the login process uses `SignInManager.PasswordSignInAsync()`, which is a typical method in ASP.NET Core Identity for handling user authentication. Here’s how it works and what happens with the session:

How `PasswordSignInAsync` Works:

1. **User Lookup and Password Check:**
   The method checks if the provided email and password match a user in the Identity store.
2. **Session Persistence `isPersistent` Flag:**
   We currently have `isPersistent: false`, which means that after closing the browser, the session is terminated. Setting it to `true` would create a persistent session cookie.
3. **Lockout Handling:**
   With `lockoutOnFailure: true`, failed login attempts can lock the user account based on Identity’s configuration.
4. **Session Creation:**
   If the login succeeds, ASP.NET Core Identity generates a secure, encrypted authentication cookie containing the user’s claims. This cookie is stored in the user’s browser and acts as the session state.
