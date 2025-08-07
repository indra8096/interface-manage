-- AlterTable
ALTER TABLE "global_cards" ADD COLUMN     "company_id" INTEGER;

-- AddForeignKey
ALTER TABLE "global_cards" ADD CONSTRAINT "global_cards_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
