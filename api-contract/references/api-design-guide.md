# API Design & Contract Governance Guide

Technical standards for designing resilient, backward-compatible APIs and interfaces.

## 1. Schema-First Contract Definition
- **Explicit Schema Specifications**: Maintain canonical schema contracts (OpenAPI, JSON Schema, Protobuf, GraphQL SDL) before generating client or server bindings.
- **Strict Typing**: Enforce runtime payload validation (e.g., Zod, Pydantic, AJV) at API boundaries.

## 2. Backward Compatibility & Evolution
- **Non-Breaking Changes**:
  - Adding optional fields to request bodies.
  - Adding new fields to response bodies.
  - Adding new independent endpoints or query parameters.
- **Breaking Changes (Forbidden in Minor/Patch Versions)**:
  - Renaming or removing existing fields.
  - Changing field data types or making optional fields mandatory.
  - Modifying error response code shapes or HTTP status semantics.

## 3. Error Contract Uniformity
- All error responses must adhere to RFC 7807 (Problem Details for HTTP APIs) or a unified JSON envelope:
  ```json
  {
    "error": {
      "code": "RESOURCE_NOT_FOUND",
      "message": "User with ID usr_123 not found.",
      "details": []
    }
  }
  ```
