import type { ID } from '@/types/common.types';

/**
 * Base Entity Interface (Module 2 - Step 2.2).
 */
export interface IBaseEntity {
  readonly id: ID;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Timestamps Interface.
 */
export interface ITimestamps {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt?: string | null;
}

/**
 * Auditable Entity Interface.
 */
export interface IAuditableEntity extends IBaseEntity {
  readonly createdBy?: ID;
  readonly updatedBy?: ID;
}
