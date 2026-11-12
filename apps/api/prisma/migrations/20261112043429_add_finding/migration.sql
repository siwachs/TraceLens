/*
  Warnings:

  - You are about to drop the `Input` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Investigation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PipelineRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResearchAsset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResearchAssetArtifact` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Input" DROP CONSTRAINT "Input_investigationId_fkey";

-- DropForeignKey
ALTER TABLE "Input" DROP CONSTRAINT "Input_researchAssetId_fkey";

-- DropForeignKey
ALTER TABLE "PipelineRun" DROP CONSTRAINT "PipelineRun_inputId_fkey";

-- DropForeignKey
ALTER TABLE "PipelineRun" DROP CONSTRAINT "PipelineRun_investigationId_fkey";

-- DropForeignKey
ALTER TABLE "ResearchAsset" DROP CONSTRAINT "ResearchAsset_investigationId_fkey";

-- DropForeignKey
ALTER TABLE "ResearchAssetArtifact" DROP CONSTRAINT "ResearchAssetArtifact_researchAssetId_fkey";

-- DropTable
DROP TABLE "Input";

-- DropTable
DROP TABLE "Investigation";

-- DropTable
DROP TABLE "PipelineRun";

-- DropTable
DROP TABLE "ResearchAsset";

-- DropTable
DROP TABLE "ResearchAssetArtifact";

-- DropEnum
DROP TYPE "InputOrigin";

-- DropEnum
DROP TYPE "InputStatus";

-- DropEnum
DROP TYPE "InputType";

-- DropEnum
DROP TYPE "PipelineRunStatus";

-- DropEnum
DROP TYPE "ResearchAssetStatus";
