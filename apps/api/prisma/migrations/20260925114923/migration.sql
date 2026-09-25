-- CreateEnum
CREATE TYPE "ResearchAssetStatus" AS ENUM ('UPLOADING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "ResearchAsset" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "status" "ResearchAssetStatus" NOT NULL DEFAULT 'UPLOADING',
    "sha256" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResearchAsset_investigationId_idx" ON "ResearchAsset"("investigationId");

-- AddForeignKey
ALTER TABLE "ResearchAsset" ADD CONSTRAINT "ResearchAsset_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
