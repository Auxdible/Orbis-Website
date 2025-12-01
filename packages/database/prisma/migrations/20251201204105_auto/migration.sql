/*
  Warnings:

  - Added the required column `hash` to the `resource_description_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hash` to the `version_changelog_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "resource_description_images" ADD COLUMN     "hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "version_changelog_images" ADD COLUMN     "hash" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "resource_description_images_uploadedBy_hash_idx" ON "resource_description_images"("uploadedBy", "hash");

-- CreateIndex
CREATE INDEX "version_changelog_images_uploadedBy_hash_idx" ON "version_changelog_images"("uploadedBy", "hash");
