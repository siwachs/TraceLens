-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('IMAGE', 'USERNAME', 'EMAIL', 'PHONE', 'URL', 'DOMAIN', 'NAME', 'TEXT');

-- CreateEnum
CREATE TYPE "InputOrigin" AS ENUM ('USER', 'DISCOVERED');

-- CreateEnum
CREATE TYPE "InputStatus" AS ENUM ('PROPOSED', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Input" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "type" "InputType" NOT NULL,
    "value" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT '',
    "origin" "InputOrigin" NOT NULL DEFAULT 'USER',
    "status" "InputStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "researchAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Input_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Input_researchAssetId_key" ON "Input"("researchAssetId");

-- CreateIndex
CREATE INDEX "Input_investigationId_idx" ON "Input"("investigationId");

-- CreateIndex
CREATE UNIQUE INDEX "Input_investigationId_type_platform_normalizedValue_key" ON "Input"("investigationId", "type", "platform", "normalizedValue");

-- AddForeignKey
ALTER TABLE "Input" ADD CONSTRAINT "Input_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Input" ADD CONSTRAINT "Input_researchAssetId_fkey" FOREIGN KEY ("researchAssetId") REFERENCES "ResearchAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
