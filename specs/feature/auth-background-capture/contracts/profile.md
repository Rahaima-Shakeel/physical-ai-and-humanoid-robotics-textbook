# API Contract: User Profiles

## GET /api/v1/profile
- **Auth**: Required (Bearer)
- **Response**:
  ```json
  {
    "userId": "string",
    "software_background": {},
    "hardware_background": {},
    "updatedAt": "string"
  }
  ```

## POST /api/v1/profile
- **Auth**: Required (Bearer)
- **Body**:
  ```json
  {
    "software_background": {},
    "hardware_background": {}
  }
  ```
- **Response**: `{ "status": "success" }`
