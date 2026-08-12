import type { Action } from '../../domain/actions';

export type TransformRequest = {
  action: Action;
  sourceText: string;
  targetLanguage?: string;
  instruction?: string;
};

export type TransformResult = {
  text: string;
  citations?: string[];
};

export interface TextTransformer {
  transform(request: TransformRequest, signal?: AbortSignal): Promise<TransformResult>;
}
