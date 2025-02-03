# Fremtidsmat Web Application

This is the Bachelor project of:

- Kjell Wiggo Abrahamsen (s374924)
- Mats August Schmid Olsen (s360784)
- Harald Hammershaug (s374171)
- Gunnar Larsson (s375150)

A web application for managing products in a centralized system, featuring user roles, secure authentication, and a React frontend.

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technologies Used](#3-technologies-used)
4. [Setup and Installation](#4-setup-and-installation)
5. [Usage](#5-usage)
6. [Roles and Permissions](#6-roles-and-permissions)
7. [Authentication and Security](#7-authentication-and-security)
8. [Development Notes](#8-development-notes)
9. [Future Improvements](#9-future-improvements)

## 1 Project Overview

Fremtidsmat is a web-based tool that allows producers, researchers, and administrators to register and manage food products in a secure environment. The system implements role-based access control and API endpoints for interacting with the backend.

## 2 Features

### Backend Features

- Entity Framework with SQLite Migrations and Identity set up.
- Identity is set up with role and admin user seeding.
- Logger for error handling.
- DAL with Interface Repository, Repository and DbContext.
- DTO folder for React transfer objects.
- Account controller containing a basic login test method.
- Swagger for API exploring.

## 3 Technologies Used

- Backend: ASP.NET Core 8 with Entity Framework Core
- Frontend: React with Axios for API calls
- Authentication: ASP.NET Identity with secure cookies
- Database: Migrations on SQLite
- API Testing: Swagger and Postman
- Logging: Serilog
- Version Control: GitHub

## 4 Setup and Installation

### Prerequisites

- .NET 8 SDK.
- Node.js (for React frontend).
- Git.

### Backend Setup

1. Clone the repository:

```bash
git clone <repo-url>
cd Backend
```

2. Restore NuGet packages:

```bash
dotnet restore
```

3. Apply migrations and seed roles/users:

```bash
dotnet ef database update
```

4. Run the backend server:

```bash
# Production mode without Swagger
dotnet run

# Devloper mode with Swagger enabled
dotnet run dev
```

Swagger can be accessed through `http://localhost:port/Swagger/index.html`.

### Frontend Setup

1. Navigate to the frontent directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the React development server:

```bash
npm start
```

## 5 Usage

### API Endpoints

| **Endpoint**          | **Method** | **Description** | **Authorization** |
| --------------------- | ---------- | --------------- | ----------------- |
| /api/Account/login    | POST       | User login      | Public            |
| /api/Account/logout   | POST       | User logout     | Authenticated     |
| /api/Account/authTest | GET        | Admin role test | Admin             |

### Frontend Usage

- Access the application at `http://localhost:<port>`.
- Login using seeded accounts for testing:
  - Admin: admin@example.com, Admin123!
  - Producer: producer@example.com, Producer123!
  - Researcher: researcher@example.com, Researcher123!

## 6 Roles and Permissions

| **Role**       | **Permissions**           |
| -------------- | ------------------------- |
| **Admin**      | Read, Update, Delete      |
| **Producer**   | Read, Add, Update, Delete |
| **Researcher** | Read                      |

## 7 Authentication and Security

- ASP.NET Identity for user management.
- HTTP-only cookies for session handling.
- Role-Based Authorization.
- MFA Support (to be implemented).

### API Authentication and Authorization

To ensure proper status codes for API requests:

- **401 Unauthorized:** Returned when the user is unauthenticated (not logged in).
- **403 Forbidden:** Returned when the user is authenticated but does not have the required permissions.

This is achieved by configuring the application cookie settings in `Program.cs`:

```csharp
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnRedirectToLogin = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        }

        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        }

        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };
});
```

### Session Handling

In the current repository `AccountRepository`, the login process uses `SignInManager.PasswordSignInAsync()`, which is a typical method in ASP.NET Core Identity for handling user authentication. Here’s how it works and what happens with the session:

How `PasswordSignInAsync` Works:

1. **User Lookup and Password Check:**
   The method checks if the provided email and password match a user in the Identity store.
2. **Session Persistence `isPersistent` Flag:**
   We currently have `isPersistent: false`, which means that after closing the browser, the session is terminated. Setting it to `true` would create a persistent session cookie.
3. **Lockout Handling:**
   With `lockoutOnFailure: true`, failed login attempts can lock the user account based on Identity’s configuration.
4. **Session Creation:**
   If the login succeeds, ASP.NET Core Identity generates a secure, encrypted authentication cookie containing the user’s claims. This cookie is stored in the user’s browser and acts as the session state.

## 8 Development Notes

### Project Structure

```bash
├── Backend
│   ├── Backend.csproj
│   ├── Backend.sln
│   ├── Controllers
│   │   └── AccountController.cs
│   ├── DAL
│   │   ├── AccountRepository.cs
│   │   ├── ApplicationDbContext.cs
│   │   ├── IAccountRepository.cs
│   │   └── Seed
│   │       ├── RoleSeeder.cs
│   │       └── UserSeeder.cs
│   ├── DTO
│   ├── Logs
│   ├── Migrations
│   │   ├── 20250129194901_InitialCreate.Designer.cs
│   │   ├── 20250129194901_InitialCreate.cs
│   │   └── ApplicationDbContextModelSnapshot.cs
│   ├── Models
│   │   └── ErrorViewModel.cs
│   ├── Program.cs
│   ├── Properties
│   │   └── launchSettings.json
│   ├── Services
│   │   └── DummyEmailSender.cs
│   ├── app.db
│   ├── appsettings.Development.json
│   ├── appsettings.json
│   └── wwwroot
│       ├── css
│       ├── favicon.ico
│       ├── js
│       └── lib
├── Frontend
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   └── vite.svg
│   ├── src
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── assets
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── README.md
```

### Important Files

- Program.cs: Configures backend services, Identity and routes.
- ApplicationRepository.cs: Handles business logic for authentication.
- AccountController.cs: API endpoints for account management.

## 9 Future Improvements

- Implementing comprehensive unit and integration testing.
- Improve frontend design with additional features.
