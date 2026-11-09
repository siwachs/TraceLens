-- CreateEnum
CREATE TYPE "PipelineRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');

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

-- CreateIndex
CREATE INDEX "PipelineRun_investigationId_idx" ON "PipelineRun"("investigationId");

-- CreateIndex
CREATE INDEX "PipelineRun_status_createdAt_idx" ON "PipelineRun"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineRun_inputId_pipeline_round_key" ON "PipelineRun"("inputId", "pipeline", "round");

-- AddForeignKey
ALTER TABLE "PipelineRun" ADD CONSTRAINT "PipelineRun_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineRun" ADD CONSTRAINT "PipelineRun_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "Input"("id") ON DELETE CASCADE ON UPDATE CASCADE;
