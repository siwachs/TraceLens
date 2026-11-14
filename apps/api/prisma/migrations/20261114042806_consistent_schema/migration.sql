/*
  Warnings:

  - You are about to drop the column `researchAssetId` on the `Input` table. All the data in the column will be lost.
  - The `status` column on the `Investigation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `investigationId` on the `ResearchAsset` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id,investigationId]` on the table `Input` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,investigationId]` on the table `PipelineRun` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[inputId]` on the table `ResearchAsset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,investigationId]` on the table `Snapshot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inputId` to the `ResearchAsset` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_investigationId_fkey";

-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_runId_fkey";

-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_snapshotId_fkey";

-- DropForeignKey
ALTER TABLE "Input" DROP CONSTRAINT "Input_researchAssetId_fkey";

-- DropForeignKey
ALTER TABLE "PipelineRun" DROP CONSTRAINT "PipelineRun_inputId_fkey";

-- DropForeignKey
ALTER TABLE "PipelineRun" DROP CONSTRAINT "PipelineRun_investigationId_fkey";

-- DropForeignKey
ALTER TABLE "ResearchAsset" DROP CONSTRAINT "ResearchAsset_investigationId_fkey";

-- DropForeignKey
ALTER TABLE "Snapshot" DROP CONSTRAINT "Snapshot_investigationId_fkey";

-- DropForeignKey
ALTER TABLE "Snapshot" DROP CONSTRAINT "Snapshot_runId_fkey";

-- DropIndex
DROP INDEX "Finding_runId_idx";

-- DropIndex
DROP INDEX "Input_investigationId_idx";

-- DropIndex
DROP INDEX "Input_researchAssetId_key";

-- DropIndex
DROP INDEX "ResearchAsset_investigationId_idx";

-- DropIndex
DROP INDEX "ResearchAssetArtifact_researchAssetId_idx";

-- AlterTable
ALTER TABLE "Input" DROP COLUMN "researchAssetId";

-- AlterTable
ALTER TABLE "Investigation" DROP COLUMN "status",
ADD COLUMN     "status" "InvestigationStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "ResearchAsset" DROP COLUMN "investigationId",
ADD COLUMN     "inputId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Input_id_investigationId_key" ON "Input"("id", "investigationId");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineRun_id_investigationId_key" ON "PipelineRun"("id", "investigationId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchAsset_inputId_key" ON "ResearchAsset"("inputId");

-- CreateIndex
CREATE UNIQUE INDEX "Snapshot_id_investigationId_key" ON "Snapshot"("id", "investigationId");

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_runId_investigationId_fkey" FOREIGN KEY ("runId", "investigationId") REFERENCES "PipelineRun"("id", "investigationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_snapshotId_investigationId_fkey" FOREIGN KEY ("snapshotId", "investigationId") REFERENCES "Snapshot"("id", "investigationId") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineRun" ADD CONSTRAINT "PipelineRun_inputId_investigationId_fkey" FOREIGN KEY ("inputId", "investigationId") REFERENCES "Input"("id", "investigationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchAsset" ADD CONSTRAINT "ResearchAsset_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "Input"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_runId_investigationId_fkey" FOREIGN KEY ("runId", "investigationId") REFERENCES "PipelineRun"("id", "investigationId") ON DELETE CASCADE ON UPDATE CASCADE;
