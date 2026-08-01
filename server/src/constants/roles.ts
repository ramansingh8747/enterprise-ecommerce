export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    VENDOR: "VENDOR",
    CUSTOMER: "CUSTOMER",
    DELIVERY_BOY: "DELIVERY_BOY",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const ROLE_VALUES: ReadonlySet<string> = new Set(Object.values(ROLES));

export const isRole = (value: string): value is Role => {
    return ROLE_VALUES.has(value);
};
