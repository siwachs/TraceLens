import { Injectable } from '@nestjs/common';

import type { InputType } from '../../generated/prisma/enums.js';
import type { Pipeline } from '../types/index.js';

@Injectable()
export class PipelineRegistryService {
  private readonly pipelines = new Map<string, Pipeline>();

  register(pipeline: Pipeline): void {
    if (this.pipelines.has(pipeline.id)) {
      throw new Error(`Pipeline "${pipeline.id}" is already registered`);
    }

    this.pipelines.set(pipeline.id, pipeline);
  }

  get(id: string): Pipeline | undefined {
    return this.pipelines.get(id);
  }

  list(): Pipeline[] {
    return [...this.pipelines.values()];
  }

  forInputType(type: InputType): Pipeline[] {
    return this.list().filter((pipeline) => pipeline.accepts === type);
  }
}
