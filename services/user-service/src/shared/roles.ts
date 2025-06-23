// services/user-service/src/shared/roles.ts

export type Role = 'admin' | 'user' | 'guest';

export const Permissions = {
    ADMIN: ['create_user', 'delete_user', 'list_user'],
    USER: ['list_user'],
} as const