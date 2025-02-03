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

### Frontend Usage

- Access the application at `http://localhost:<port>`.
- Login using seeded accounts for testing:
  - Admin: admin@example.com, Admin123!
  - Producer: producer@example.com, Producer123!
  - Researcher: researcher@example.com, Researcher123!

## 6 Roles and Permissions

## 7 Authentication and Security

- ASP.NET Identity for user management.
- HTTP-only cookies for session handling.
- Role-Based Authorization.
- MFA Support (to be implemented).

### Session Handling

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

## 8 Development Notes

### Project Structure

### Important Files

- Program.cs: Configures backend services, Identity and routes.
- ApplicationRepository.cs: Handles business logic for authentication.
- AccountController.cs: API endpoints for account management.

## 9 Future Improvements

- Implementing comprehensive unit and integration testing.
- Improve frontend design with additional features.
