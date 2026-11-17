import type { Input } from '../../generated/prisma/client.js';
import type {
  FindingConfidence,
  FindingStatus,
  InputType,
} from '../../generated/prisma/enums.js';

/** One fact or check result, as a pipeline produces it. The runner persists it as a Finding. */
export interface FindingDraft {
  kind: string;
  entityType?: string;
  entityValue?: string;

  checkStatus?: FindingStatus;
  confidence?: FindingConfidence;
  basis?: string;

  source: string;
  sourceUrl?: string;

  dedupeKey: string;
  payload: Record<string, unknown>;

  observedAt?: Date;
}

export interface PipelineContext {
  runId: string;
  investigationId: string;
  input: Input;
  signal: AbortSignal;
}

export interface Pipeline {
  /** Stored in PipelineRun.pipeline, e.g. "image". */
  readonly id: string;
  /** The one input type this pipeline runs on. */
  readonly accepts: InputType;
  /** Every finding kind this pipeline may produce. The runner will reject any other. */
  readonly kinds: readonly string[];
  /** Yields findings as they are produced, so partial results survive a crash. */
  execute(context: PipelineContext): AsyncIterable<FindingDraft>;
}
