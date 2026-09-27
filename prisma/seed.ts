import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { code: 'users.read', description: 'Ver usuarios' },
  { code: 'users.write', description: 'Crear, editar y eliminar usuarios' },
  { code: 'roles.read', description: 'Ver roles y permisos' },
  { code: 'roles.write', description: 'Crear, editar y eliminar roles' },
  { code: 'partners.read', description: 'Ver proveedores y clientes' },
  { code: 'partners.write', description: 'Crear, editar y eliminar terceros' },
  { code: 'costs.read', description: 'Ver costos' },
  { code: 'costs.write', description: 'Registrar costos' },
  { code: 'budgets.read', description: 'Ver presupuestos' },
  { code: 'budgets.write', description: 'Elaborar presupuestos' },
  { code: 'trips.read', description: 'Ver viajes y operaciones' },
  { code: 'trips.write', description: 'Registrar viajes y liquidaciones' },
  { code: 'reports.read', description: 'Ver reportes y tablero' },
] as const;

const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  ADMIN: PERMISSIONS.map((p) => p.code),
  GERENTE: PERMISSIONS.map((p) => p.code),
  ADMINISTRADOR: [
    'users.read',
    'users.write',
    'roles.read',
    'roles.write',
    'partners.read',
    'partners.write',
    'costs.read',
    'costs.write',
    'budgets.read',
    'budgets.write',
    'trips.read',
    'reports.read',
  ],
  OPERADOR: [
    'partners.read',
    'costs.read',
    'trips.read',
    'trips.write',
    'reports.read',
  ],
};

async function main() {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: { description: permission.description },
      create: permission,
    });
  }

  const roles: { slug: string; name: string; description: string }[] = [
    {
      slug: 'ADMIN',
      name: 'Administrador del sistema',
      description: 'Acceso total a configuración, usuarios y operación.',
    },
    {
      slug: 'GERENTE',
      name: 'Gerente general',
      description: 'Supervisión de costos, presupuestos, terceros y reportes.',
    },
    {
      slug: 'ADMINISTRADOR',
      name: 'Administrador de la empresa',
      description: 'Gestión diaria administrativa y de terceros.',
    },
    {
      slug: 'OPERADOR',
      name: 'Operador',
      description: 'Registro de viajes y consulta de información operativa.',
    },
  ];

  for (const role of roles) {
    const saved = await prisma.role.upsert({
      where: { slug: role.slug },
      update: { name: role.name, description: role.description },
      create: role,
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: saved.id } });
    const permissionCodes = ROLE_PERMISSIONS[role.slug];
    const permissions = await prisma.permission.findMany({
      where: { code: { in: [...permissionCodes] } },
    });
    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: saved.id,
        permissionId: permission.id,
      })),
    });
  }

  const settings: Record<string, string> = {
    ruc: '20613686569',
    legalName: 'AGRONEGOCIOS CORONADO S.A.C.',
    address: 'Car. El Rosario Chao S/N, Fundo El Rosario',
    department: 'La Libertad',
    province: 'Virú',
    district: 'Virú',
    phone: '947971805',
    email: 'agronegocioscoronado@hotmail.com',
    activity:
      '4923 - Transporte de carga por carretera / 0161 - Apoyo a la agricultura',
    representative: 'Soles Rodriguez Esmeralda Natali',
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.companySetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { slug: 'ADMIN' },
  });
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@agronegocioscoronado.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Coronado2026!';
  const adminName = process.env.ADMIN_NAME ?? 'Administrador del sistema';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      roleId: adminRole.id,
    },
  });

  const samplePartners = [
    {
      kind: 'CLIENTE' as const,
      personType: 'JURIDICA' as const,
      documentType: 'RUC' as const,
      documentNumber: '20123456789',
      businessName: 'Agroindustrial Casa Grande S.A.A.',
      tradeName: 'Casa Grande',
      email: 'logistica@casagrande.pe',
      phone: '044400100',
      department: 'La Libertad',
      province: 'Ascope',
      district: 'Casa Grande',
      address: 'Casa Grande',
      notes: 'Cliente de ejemplo para transporte de caña.',
    },
    {
      kind: 'PROVEEDOR' as const,
      personType: 'JURIDICA' as const,
      documentType: 'RUC' as const,
      documentNumber: '20456789123',
      businessName: 'Combustibles Chao E.I.R.L.',
      tradeName: 'Grifo Chao',
      email: 'ventas@grifochao.pe',
      phone: '944111222',
      department: 'La Libertad',
      province: 'Virú',
      district: 'Chao',
      address: 'Carretera Industrial Chao',
      notes: 'Proveedor de combustible.',
    },
    {
      kind: 'AMBOS' as const,
      personType: 'NATURAL' as const,
      documentType: 'DNI' as const,
      documentNumber: '45678912',
      firstName: 'José',
      lastName: 'Castillo Huamán',
      phone: '947555888',
      department: 'La Libertad',
      province: 'Virú',
      district: 'Virú',
      address: 'Fundo El Rosario',
      notes: 'Productor de caña; también contrata flete.',
    },
  ];

  for (const partner of samplePartners) {
    await prisma.partner.upsert({
      where: { documentNumber: partner.documentNumber },
      update: partner,
      create: partner,
    });
  }

  const categories = [
    { code: 'OPE-COMB', name: 'Combustible', type: 'OPERATIVO' as const },
    { code: 'OPE-MANT', name: 'Mantenimiento de unidades', type: 'OPERATIVO' as const },
    { code: 'VAR-PEAJE', name: 'Peajes y viáticos', type: 'VARIABLE' as const },
    { code: 'FIJ-ADM', name: 'Gastos administrativos', type: 'FIJO' as const },
  ];

  for (const category of categories) {
    await prisma.costCategory.upsert({
      where: { code: category.code },
      update: { name: category.name, type: category.type },
      create: category,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
