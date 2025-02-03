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
