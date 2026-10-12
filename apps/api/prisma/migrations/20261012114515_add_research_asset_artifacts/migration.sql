-- CreateTable
CREATE TABLE "ResearchAssetArtifact" (
    "id" TEXT NOT NULL,
    "researchAssetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchAssetArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResearchAssetArtifact_researchAssetId_idx" ON "ResearchAssetArtifact"("researchAssetId");

-- AddForeignKey
ALTER TABLE "ResearchAssetArtifact" ADD CONSTRAINT "ResearchAssetArtifact_researchAssetId_fkey" FOREIGN KEY ("researchAssetId") REFERENCES "ResearchAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
