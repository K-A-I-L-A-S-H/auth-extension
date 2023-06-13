import { Permission } from '../src/api/iam/constants';
import { UserRoles } from '../src/api/iam/types';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ROLES: string[] = Object.keys(UserRoles);

const PERMISSIONS: string[] = Object.keys(Permission);

async function seed() {
  const roles = await Promise.resolve(
    ROLES.map(async (roleVal) => {
      const role = prisma.role.upsert({
        where: { role: roleVal },
        update: {},
        create: {
          role: roleVal,
        },
      });
      return role;
    }),
  );

  const permissions = await Promise.all(
    PERMISSIONS.map(async (permissionVal) => {
      const permission = prisma.permission.upsert({
        where: { permission: permissionVal },
        update: {},
        create: {
          permission: permissionVal,
        },
      });
      return permission;
    }),
  );

  const salt = bcrypt.genSaltSync();
  const user = await prisma.user.upsert({
    where: { email: 'user@mail.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: `user`,
      password: bcrypt.hashSync('password@123', salt),
      role: {
        connect: {
          id: (await roles[0]).id,
        },
      },
    },
  });

  await Promise.all(
    permissions.map(async (permission) => {
      await prisma.userPermission.create({
        data: {
          userId: user.id,
          permissionId: permission.id,
        },
      });
    }),
  );
}

seed()
  .catch((err) => {
    console.error(`Error while adding seed data: ${JSON.stringify(err)}`);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
