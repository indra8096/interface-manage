/*
  Warnings:

  - You are about to drop the column `content` on the `global_cards` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `global_cards` table. All the data in the column will be lost.
  - Added the required column `name` to the `global_cards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "global_cards" DROP COLUMN "content",
DROP COLUMN "title",
ADD COLUMN     "defaultImportance" TEXT NOT NULL DEFAULT 'Moyenne',
ADD COLUMN     "defaultScore" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "icon" TEXT NOT NULL DEFAULT '🛡️',
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "panel_cards" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "total" INTEGER,
    "completed" INTEGER,
    "equipmentCount" INTEGER,
    "status" TEXT,
    "certificationDate" TIMESTAMP(3),
    "nextAudit" TIMESTAMP(3),
    "priority" TEXT,
    "description" TEXT,
    "deadline" TIMESTAMP(3),
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "panel_cards_pkey" PRIMARY KEY ("id")
);
