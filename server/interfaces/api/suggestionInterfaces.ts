import type {
  SuggestionCategory,
  SuggestionStatus,
} from '@server/constants/suggestion';
import type Suggestion from '@server/entity/Suggestion';
import type { PaginatedResponse } from './common';

export interface SuggestionResultsResponse extends PaginatedResponse {
  results: Suggestion[];
}

export interface SuggestionRequestBody {
  category: SuggestionCategory;
  message: string;
  pageUrl?: string;
}

export interface SuggestionStatusRequestBody {
  status: SuggestionStatus;
}
