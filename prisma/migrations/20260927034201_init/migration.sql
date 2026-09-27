-- CreateEnum
CREATE TYPE "RoleSlug" AS ENUM ('ADMIN', 'GERENTE', 'ADMINISTRADOR', 'OPERADOR');

-- CreateEnum
CREATE TYPE "PartnerKind" AS ENUM ('PROVEEDOR', 'CLIENTE', 'AMBOS');

-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('NATURAL', 'JURIDICA');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DNI', 'RUC', 'CE');

-- CreateEnum
CREATE TYPE "CostCategoryType" AS ENUM ('FIJO', 'VARIABLE', 'OPERATIVO');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('DRAFT', 'APPROVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVO', 'MANTENIMIENTO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAMION', 'TRACTO', 'REMOLQUE', 'OTRO');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PROGRAMADO', 'EN_CURSO', 'COMPLETADO', 'LIQUIDADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'YAPE', 'PLIN', 'CREDITO', 'OTRO');

-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('FACTURA', 'BOLETA', 'RECIBO', 'SIN_COMPROBANTE', 'OTRO');

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" "RoleSlug" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "kind" "PartnerKind" NOT NULL,
    "personType" "PersonType" NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "businessName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "tradeName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "department" TEXT,
    "province" TEXT,
    "district" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerContact" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "PartnerContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCategory" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CostCategoryType" NOT NULL,

    CONSTRAINT "CostCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostEntry" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "partnerId" TEXT,
    "tripId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "description" TEXT,
    "voucherType" "VoucherType" NOT NULL DEFAULT 'SIN_COMPROBANTE',
    "voucherNumber" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'EFECTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "status" "BudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLine" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "plannedAmount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "capacityTon" DECIMAL(8,2),
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "license" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "distanceKm" DECIMAL(8,2),
    "estimatedHours" DECIMAL(6,2),

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "clientId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'PROGRAMADO',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripLoad" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "caneType" TEXT,
    "tonnage" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "TripLoad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripSettlement" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "freightRate" DECIMAL(12,2) NOT NULL,
    "grossAmount" DECIMAL(12,2) NOT NULL,
    "deductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expenses" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(12,2) NOT NULL,
    "settledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CompanySetting_key_key" ON "CompanySetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_documentNumber_key" ON "Partner"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CostCategory_code_key" ON "CostCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetLine_budgetId_categoryId_key" ON "BudgetLine"("budgetId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_key" ON "Vehicle"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_dni_key" ON "Driver"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "TripSettlement_tripId_key" ON "TripSettlement"("tripId");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerContact" ADD CONSTRAINT "PartnerContact_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCategory" ADD CONSTRAINT "CostCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CostCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostEntry" ADD CONSTRAINT "CostEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CostCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostEntry" ADD CONSTRAINT "CostEntry_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostEntry" ADD CONSTRAINT "CostEntry_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CostCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripLoad" ADD CONSTRAINT "TripLoad_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSettlement" ADD CONSTRAINT "TripSettlement_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
