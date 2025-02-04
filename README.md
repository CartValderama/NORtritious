# Fremtidsmat Web Application

This is the Bachelor project of:

- Kjell Wiggo Abrahamsen (s374924)
- Mats August Schmid Olsen (s360784)
- Harald Hammershaug (s374171)
- Gunnar Larsson (s375150)

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technologies Used](#3-technologies-used)
4. [Setup and Installation](#4-setup-and-installation)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
5. [Usage](#5-usage)
   - [API Endpoints](#api-endpoints)
   - [Frontend Usage](#frontend-usage)
6. [Roles and Permissions](#6-roles-and-permissions)
7. [Authentication and Security](#7-authentication-and-security)
   - [API Authentication and Authorization](#api-authentication-and-authorization)
   - [Cookie Configuration](#cookie-configuration)
8. [Development Notes](#8-development-notes)
9. [Future Improvements](#9-future-improvements)

## 1 Project Overview

Fremtidsmat is a web-based tool that allows producers, researchers, and administrators to register and manage food products, as well as validate food standards certificates in a secure environment. The system implements role-based access control and API endpoints for interacting with the backend.

## 2 Features

### Backend Features

- Entity Framework with SQLite Migrations and Identity set up.
- Identity is set up with role and test user seeding.
- Logger for error handling.
- DAL with Interface Repositories, Repositories and DbContext.
- DTO folder for React transfer objects.
- Account controller containing a basic login and logout test methods.
- Products controller containing basic CRUD methods.
- Swagger for API exploring in dev mode.

## 3 Technologies Used

- Backend: ASP.NET Core 8 with Entity Framework Core
- Frontend: React with Axios for API calls
- Authentication: ASP.NET Identity with secure cookies
- Database: Migrations on SQLite
- API Testing: Swagger
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

| **Endpoint**                 | **Method** | **Description**    | **Authorization** |
| ---------------------------- | ---------- | ------------------ | ----------------- |
| /api/account/login           | POST       | User login         | Public            |
| /api/account/logout          | POST       | User logout        | Authenticated     |
| /api/account/admin-role-test | GET        | Admin role test    | Admin             |
| /api/products                | GET        | Get all products   | Authenticated     |
| /api/products                | POST       | Create product     | Producer          |
| /api/products/{id}           | GET        | Get products by id | Authenticated     |
| /api/products/{id}           | PUT        | Update product     | Admin, Producer   |
| /api/products/{id}           | DELETE     | Delete product     | Admin, Producer   |

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

### Cookie Configuration

This application uses ASP.NET Core Identity for user authentication. To manage the user sessions, the application uses a secure authentication cookie that stores the user’s login information.

#### Cookie Configuration Details

- **Cookie Name:** "YourAppAuthCookie"
  This is the name of the cookie that stores the authentication token. It is used for managing the user’s session.
- **HttpOnly:** true
  This flag ensures that the cookie is inaccessible via JavaScript, preventing cross-site scripting (XSS) attacks.
- **Secure:** CookieSecurePolicy.Always
  The cookie is only sent over HTTPS connections, ensuring data security when transmitted over the network.
- **SameSite:** SameSiteMode.Strict
  This setting restricts the cookie from being sent along with cross-site requests, reducing the risk of cross-site request forgery (CSRF) attacks.
- **Expiration:** 14 days
  The authentication cookie expires after 14 days of inactivity. After expiration, the user will need to log in again.

#### Cookie Behavior

- **Login Redirection:** If a user tries to access a protected API or resource without being authenticated, they will receive a 401 Unauthorized response. If a user is authenticated but lacks the required permissions, they will receive a 403 Forbidden response.
- **Automatic Session Management:** ASP.NET Core Identity handles the session lifecycle through the authentication cookie. No additional session management is required unless specified by the developer.

#### Security Considerations

- **Cookies are configured to be secure and HttpOnly**, which protects the application from common vulnerabilities such as XSS and CSRF.
- **Password policies** and **lockout settings** ensure that user credentials are managed securely, and users who exceed the maximum number of failed login attempts are temporarily locked out.

## 8 Development Notes

### Project Structure

```bash
├── Backend
│   ├── Backend.csproj
│   ├── Backend.sln
│   ├── Controllers
│   │   ├── AccountController.cs
│   │   └── ProductsController.cs
│   ├── DAL
│   │   ├── AccountRepository.cs
│   │   ├── ApplicationDbContext.cs
│   │   ├── IAccountRepository.cs
│   │   ├── IProductsRepository.cs
│   │   ├── ProductsRepository.cs
│   │   └── Seed
│   │       ├── RoleSeeder.cs
│   │       └── UserSeeder.cs
│   ├── DTO
│   │   ├── ProductDTO.cs
│   │   └── UserDTO.cs
│   ├── Logs
│   ├── Migrations
│   ├── Models
│   │   ├── ErrorViewModel.cs
│   │   └── Product.cs
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

## 9 Future Improvements

- Implementing comprehensive unit and integration testing.
- Improve frontend design with additional features.
