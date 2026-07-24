// Barrel for the data layer — import domain types and access functions from
// "@/data". Keep all data access behind this module so the mock → real swap in
// Phase 2 has a single seam.
export * from "./types"
export * from "./accounts"
export * from "./investments"
export * from "./manualItems"
export * from "./netWorth"
export * from "./spending"
export * from "./transactions"
