# Enterprise E-commerce — Product Media API (Module 13)

**Status:** Production-ready (Steps 13.1–13.10)  
**Base path:** `/api/v1/products/:productId/media`  
**Auth:** Bearer JWT · Roles: `ADMIN`, `SUPER_ADMIN`  
**Envelope:** `{ success, message, data? }`

---

## Endpoints

| Method | Path | Multipart | Description |
|--------|------|-----------|-------------|
| POST | `/products/:productId/media` | `images` (1–N) | Upload product images |
| PATCH | `/products/:productId/media/:mediaId/primary` | — | Set primary image |
| PUT | `/products/:productId/media/:mediaId` | `image` | Replace image |
| DELETE | `/products/:productId/media/:mediaId` | — | Delete image |

---

## POST — Upload images

**URL:** `/api/v1/products/:productId/media`  
**Auth:** ADMIN / SUPER_ADMIN  
**Body:** `multipart/form-data`  
**Field:** `images` (file, repeatable)

### Rules

- MIME: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/avif`
- Extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`
- Max size: `MAX_IMAGE_SIZE_MB` (default 5)
- Max count: `MAX_PRODUCT_IMAGES` (default 10), including existing media
- First image is primary only if product has no primary
- Existing primary is never stolen by new uploads
- `displayOrder` continues from max+1

### Success `201`

```json
{
  "success": true,
  "message": "Images uploaded successfully.",
  "data": {
    "productId": "...",
    "uploaded": [
      { "id": "...", "url": "...", "isPrimary": true, "displayOrder": 1 }
    ]
  }
}
```

### Errors

| Case | Status |
|------|--------|
| Missing/invalid token | 401 |
| CUSTOMER role | 403 |
| Invalid image / empty | 400 |
| Product not found | 404 |

---

## PATCH — Set primary

**URL:** `/api/v1/products/:productId/media/:mediaId/primary`  
**Auth:** ADMIN / SUPER_ADMIN

### Success `200`

```json
{
  "success": true,
  "message": "Primary image updated successfully.",
  "data": {
    "productId": "...",
    "mediaId": "...",
    "isPrimary": true
  }
}
```

### Errors

| Case | Status |
|------|--------|
| Unauthorized / forbidden | 401 / 403 |
| Product / Media not found | 404 |
| Media does not belong to Product | 400 |
| Already primary | 409 |

---

## PUT — Replace image

**URL:** `/api/v1/products/:productId/media/:mediaId`  
**Auth:** ADMIN / SUPER_ADMIN  
**Field:** `image` (single file)

Preserves: `mediaId`, `displayOrder`, `isPrimary`, Product association.  
Deletes old storage asset after successful update. Rolls back new upload on failure.

### Success `200`

```json
{
  "success": true,
  "message": "Image replaced successfully.",
  "data": {
    "id": "...",
    "url": "...",
    "isPrimary": true,
    "displayOrder": 1
  }
}
```

---

## DELETE — Delete image

**URL:** `/api/v1/products/:productId/media/:mediaId`  
**Auth:** ADMIN / SUPER_ADMIN

Removes storage asset, Media document, and Product `media` ref.  
If primary: assigns next lowest `displayOrder`. Resequences remaining orders to `1..n`.

### Success `200`

```json
{
  "success": true,
  "message": "Image deleted successfully."
}
```

---

## Product reads (backward compatible)

Product create/list/detail responses still include legacy `images` / `thumbnail` and now attach:

```json
"media": [
  {
    "id": "...",
    "url": "...",
    "secureUrl": "...",
    "isPrimary": true,
    "displayOrder": 1,
    "mediaType": "image"
  }
]
```

---

## Testing

```bash
# Full seeded Media E2E (validators + mock-storage service suite)
npm run test:media:e2e:seeded

# Alias used by npm test
npm test

# Offline validators only
npm run test:media:validators

# HTTP smoke (requires running API)
npm run test:media:e2e
```

Postman: `postman/Product_Media_Module.postman_collection.json`
