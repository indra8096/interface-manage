/*
  Warnings:

  - You are about to drop the `companies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `global_cards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `panel_cards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'COMPANY_ADMIN', 'COMPANY_USER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('completed', 'warning', 'error');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('defensive', 'general', 'offensive');

-- CreateEnum
CREATE TYPE "PanelCardType" AS ENUM ('coverage', 'infrastructure', 'compliance', 'recommendation');

-- DropForeignKey
ALTER TABLE "global_cards" DROP CONSTRAINT "global_cards_company_id_fkey";

-- DropForeignKey
ALTER TABLE "panel_cards" DROP CONSTRAINT "panel_cards_company_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_company_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_company_id_fkey";

-- DropTable
DROP TABLE "companies";

-- DropTable
DROP TABLE "global_cards";

-- DropTable
DROP TABLE "panel_cards";

-- DropTable
DROP TABLE "tasks";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COMPANY_USER',
    "companyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'warning',
    "score" INTEGER NOT NULL DEFAULT 0,
    "category" "Category" NOT NULL DEFAULT 'general',
    "description" TEXT,
    "importance" TEXT,
    "dueDate" TEXT,
    "assignedTo" TEXT,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanelCardTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PanelCardType" NOT NULL,
    "category" "Category" NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'Moyenne',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PanelCardTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanelCardInstance" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "total" INTEGER,
    "completed" INTEGER,
    "equipmentCount" INTEGER,
    "status" TEXT,
    "certificationDate" TEXT,
    "nextAudit" TEXT,
    "deadline" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PanelCardInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "icon" TEXT,
    "defaultScore" INTEGER NOT NULL DEFAULT 0,
    "defaultImportance" TEXT NOT NULL DEFAULT 'Moyenne',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PanelCardInstance_templateId_companyId_key" ON "PanelCardInstance"("templateId", "companyId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelCardInstance" ADD CONSTRAINT "PanelCardInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PanelCardTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelCardInstance" ADD CONSTRAINT "PanelCardInstance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
