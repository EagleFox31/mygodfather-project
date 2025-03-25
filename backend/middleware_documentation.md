# Middleware Files Documentation

## 1. auth.js
- **Purpose**: Handles user authentication for protected routes.
- **Inputs**: 
  - Request containing user credentials.
- **Outputs**: 
  - User authentication status.
- **Processing**: 
  - Validates user credentials and checks for valid tokens.

## 2. errorHandler.js
- **Purpose**: Centralized error handling for the application.
- **Inputs**: 
  - Error objects from various parts of the application.
- **Outputs**: 
  - Standardized error responses.
- **Processing**: 
  - Catches errors and formats them for consistent API responses.

## 3. matchingValidations.js
- **Purpose**: Validates data for matching operations.
- **Inputs**: 
  - Data to be validated for matching.
- **Outputs**: 
  - Validation results (success or error messages).
- **Processing**: 
  - Implements validation logic specific to matching criteria.

## 4. roleAuth.js
- **Purpose**: Manages role-based access control for routes.
- **Inputs**: 
  - User roles and requested route access.
- **Outputs**: 
  - Access granted or denied status.
- **Processing**: 
  - Checks user roles against required roles for route access.

## 5. validateRequest.js
- **Purpose**: Validates incoming requests against defined schemas.
- **Inputs**: 
  - Request data to be validated.
- **Outputs**: 
  - Validation results (success or error messages).
- **Processing**: 
  - Uses schema definitions to validate request data.

## 6. validations.js
- **Purpose**: Contains common validation functions used across the application.
- **Inputs**: 
  - Various data inputs for validation.
- **Outputs**: 
  - Validation results.
- **Processing**: 
  - Implements reusable validation logic for different data types.
