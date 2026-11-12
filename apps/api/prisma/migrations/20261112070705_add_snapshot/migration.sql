-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('FOUND', 'NOT_FOUND', 'ERROR', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "FindingConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('IMAGE', 'USERNAME', 'EMAIL', 'PHONE', 'URL', 'DOMAIN', 'NAME', 'TEXT');

-- CreateEnum
CREATE TYPE "InputOrigin" AS ENUM ('USER', 'DISCOVERED');

-- CreateEnum
CREATE TYPE "InputStatus" AS ENUM ('PROPOSED', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PipelineRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "ResearchAssetStatus" AS ENUM ('UPLOADING', 'READY', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "entityType" TEXT,
    "entityValue" TEXT,
    "checkStatus" "FindingStatus" NOT NULL DEFAULT 'FOUND',
    "confidence" "FindingConfidence",
    "basis" TEXT,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "snapshotId" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Investigation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineRun" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "inputId" TEXT NOT NULL,
    "pipeline" TEXT NOT NULL,
    "status" "PipelineRunStatus" NOT NULL DEFAULT 'QUEUED',
    "round" INTEGER NOT NULL DEFAULT 0,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "failureReason" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PipelineRun_pkey" PRIMARY KEY ("id")
);

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
    "analysis" JSONB,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchAsset_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "sha256" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Finding_runId_idx" ON "Finding"("runId");

-- CreateIndex
CREATE INDEX "Finding_investigationId_entityType_entityValue_idx" ON "Finding"("investigationId", "entityType", "entityValue");

-- CreateIndex
CREATE INDEX "Finding_snapshotId_idx" ON "Finding"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "Finding_runId_dedupeKey_key" ON "Finding"("runId", "dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "Input_researchAssetId_key" ON "Input"("researchAssetId");

-- CreateIndex
CREATE INDEX "Input_investigationId_idx" ON "Input"("investigationId");

-- CreateIndex
CREATE UNIQUE INDEX "Input_investigationId_type_platform_normalizedValue_key" ON "Input"("investigationId", "type", "platform", "normalizedValue");

-- CreateIndex
CREATE INDEX "PipelineRun_investigationId_idx" ON "PipelineRun"("investigationId");

-- CreateIndex
CREATE INDEX "PipelineRun_status_createdAt_idx" ON "PipelineRun"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineRun_inputId_pipeline_round_key" ON "PipelineRun"("inputId", "pipeline", "round");

-- CreateIndex
CREATE INDEX "ResearchAsset_investigationId_idx" ON "ResearchAsset"("investigationId");

-- CreateIndex
CREATE INDEX "ResearchAssetArtifact_researchAssetId_idx" ON "ResearchAssetArtifact"("researchAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchAssetArtifact_researchAssetId_type_key" ON "ResearchAssetArtifact"("researchAssetId", "type");

-- CreateIndex
CREATE INDEX "Snapshot_runId_idx" ON "Snapshot"("runId");

-- CreateIndex
CREATE INDEX "Snapshot_investigationId_idx" ON "Snapshot"("investigationId");

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_runId_fkey" FOREIGN KEY ("runId") REFERENCES "PipelineRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Input" ADD CONSTRAINT "Input_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Input" ADD CONSTRAINT "Input_researchAssetId_fkey" FOREIGN KEY ("researchAssetId") REFERENCES "ResearchAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineRun" ADD CONSTRAINT "PipelineRun_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineRun" ADD CONSTRAINT "PipelineRun_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "Input"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchAsset" ADD CONSTRAINT "ResearchAsset_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchAssetArtifact" ADD CONSTRAINT "ResearchAssetArtifact_researchAssetId_fkey" FOREIGN KEY ("researchAssetId") REFERENCES "ResearchAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_runId_fkey" FOREIGN KEY ("runId") REFERENCES "PipelineRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
