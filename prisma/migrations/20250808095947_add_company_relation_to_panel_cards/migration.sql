-- AlterTable
ALTER TABLE "panel_cards" ADD COLUMN     "company_id" INTEGER;

-- AddForeignKey
ALTER TABLE "panel_cards" ADD CONSTRAINT "panel_cards_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
