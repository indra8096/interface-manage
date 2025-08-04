-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "importance" TEXT NOT NULL DEFAULT 'Moyenne';
