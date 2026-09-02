# Swagger UI API User Guide

This quick guide explains how to access, authenticate, and test the ProfilsActifs API endpoints using Swagger UI.

---

## 1. Accessing the Interface

1. Start the application locally:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to: http://localhost:3000/api-docs

---

## 2. Authentication (JWT)

Protected endpoints (profiles, logout, etc.) require a JWT Token.

### Step A: Obtain a Token
- Option 1 (Real account):
  1. Expand POST /auth/register -> Try it out -> Enter your details -> Execute.
  2. Expand POST /auth/login -> Enter your credentials -> Execute.
  3. Copy the "token" string from the JSON response.

- Option 2 (Immediate test token):
  Use this pre-generated development token:
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlci1pZCIsInJvbGUiOiJKT0JfU0VFS0VSIiwiaWF0IjoxNzg4MzM2NTQzLCJleHAiOjE3ODg0MjI5NDN9.nLrdJ9-bb-x23xCl3ESWsaoySOwhrRrt6ikp6ljliC0

### Step B: Enable Token in Swagger
1. Click the green Authorize button (top right).
2. Paste the token string into the Value field.
3. Click Authorize, then close the modal.

---

## 3. Testing an Endpoint

1. Click on the desired endpoint (e.g., GET /profile/me or PUT /profile).
2. Click the Try it out button.
3. If the endpoint requires a JSON body (e.g., PUT /profile), modify the values in the editor.
4. Click Execute.
5. Review the result under Server response:
   - 200 OK / 201 Created: Success.
   - 401 Unauthorized: Missing or expired token (Verify Authorize button).
   - 400 Bad Request / 422 Unprocessable: Invalid payload or business logic violation.
