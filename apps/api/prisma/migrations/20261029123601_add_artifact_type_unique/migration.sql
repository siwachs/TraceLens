/*
  Warnings:

  - A unique constraint covering the columns `[researchAssetId,type]` on the table `ResearchAssetArtifact` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ResearchAssetArtifact_researchAssetId_type_key" ON "ResearchAssetArtifact"("researchAssetId", "type");
