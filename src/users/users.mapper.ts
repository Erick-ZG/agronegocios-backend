import { Permission, Role, RolePermission, User } from '@prisma/client';

type UserWithRole = User & {
  role: Role & {
    permissions: (RolePermission & { permission: Permission })[];
  };
};

export function toPublicUser(user: UserWithRole) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: {
      id: user.role.id,
      name: user.role.name,
      slug: user.role.slug,
      description: user.role.description,
    },
    permissions: user.role.permissions.map((item) => item.permission.code),
  };
}
