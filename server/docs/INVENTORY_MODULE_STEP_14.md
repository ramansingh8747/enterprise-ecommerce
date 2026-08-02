# Enterprise E-commerce — Inventory Module Architecture (Step 14.1)

**Module:** Inventory Management  
**Status:** 14.1–14.5 ✅ · 14.6 Stock Reservation ✅  
**Pattern:** Repository → Service → Controller  

---

## Integration

| Module | Integration approach |
|--------|----------------------|
| Product | Stock keyed by `productId`; Product `quantity` remains until sync steps |
| Variant | Optional `variantId` on inventory / movements / reservations |
| Auth + RBAC | JWT + ADMIN/SUPER_ADMIN (when routes are mounted) |
| Layers | Controller → Service → Repository |

**`app.ts`:** Inventory routes are **not** mounted in Step 14.1.

---

## Folder structure

```
src/modules/inventory/
  controllers/     InventoryController (stubs)
  services/        InventoryService (stubs)
  repositories/    InventoryRepository (stubs)
  interfaces/      inventory, stock-movement, stock-reservation
  routes/          empty router + DI composition root
  validations/     placeholder chains
  constants/       defaults / collection name placeholders
  types/           enums
  utils/           placeholder barrel
  index.ts
```

---

## Prepared for

- Warehouses / multi-location inventory  
- Stock reservations & movements  
- Adjustments & reporting  

**Step 14.1 complete.**  

---

## Step 14.2 — Inventory schema

Collection: `inventories` · Model: `Inventory`

| Field | Purpose |
|-------|---------|
| `product` | Required ObjectId → Product |
| `variant` | Optional ObjectId → ProductVariant |
| `warehouseId` | Optional ObjectId → future Warehouse |
| `sku` | Indexed stock identity |
| `availableStock` / `reservedStock` / `totalStock` | Stock figures (≥ 0); total stored, not auto-calc |
| `reorderLevel` | Default 10 |
| `isActive` | Default true |
| audit + timestamps | `createdBy`, `updatedBy`, `timestamps`, `versionKey: false` |

Indexes: `sku`, `product`, `variant`, `warehouseId`, `isActive`, plus compounds `{product, variant, warehouseId}`, `{product, isActive}`.

No repository / service / API changes in 14.2.

**Step 14.2 complete.**

---

## Step 14.3 — Warehouse integration (placeholder)

- Constants: `DEFAULT_WAREHOUSE_NAME`, `DEFAULT_WAREHOUSE_CODE`
- `IWarehouseReference` + future `IWarehouse` in `interfaces/warehouse.interface.ts`
- DTO-only `warehouseCode` / `warehouseName` via `IInventoryWithWarehouse`
- Inventory MongoDB schema unchanged (`warehouseId` remains optional ObjectId)

No Warehouse CRUD, lookups, joins, or API changes.

**Step 14.3 complete.**

---

## Step 14.4 — Stock Movement

Collection: `stock_movements` · Model: `StockMovement` (append-only)

- Types: `IN` | `OUT` | `RESERVE` | `RELEASE` | `ADJUSTMENT`
- Fields: inventory, product, variant?, warehouseId?, quantity (>0), previous/new available, reference*, notes, performedBy
- Repository: `createMovement`, `getMovementsByInventory`, `getMovementsByProduct`
- Service: `recordMovement` (quantity validation only — no stock mutation)

No controller / routes / Inventory stock updates in this step.

**Step 14.4 complete.**

---

## Step 14.5 — Stock Adjustment

- Operation (not a collection): set absolute `availableStock`
- Recalculate `totalStock = availableStock + reservedStock`
- Append `ADJUSTMENT` Stock Movement with previous/new available
- Rollback Inventory snapshot if movement persistence fails
- No HTTP APIs yet

**Step 14.5 complete.**

---

## Step 14.6 — Stock Reservation

Collection: `stock_reservations` · statuses: `ACTIVE` | `RELEASED` | `CONSUMED`

- Service: `reserveStock`, `releaseStock`, `consumeReservedStock`
- Repository: create / release / consume / getByReference
- No Inventory `availableStock` / `reservedStock` mutation yet
- No Order / Checkout / Payment / HTTP APIs

**Step 14.6 complete.** Do not continue to 14.7 until confirmed.
