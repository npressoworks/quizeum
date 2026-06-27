import {
  DEFAULT_HOME_FEED_FILTERS,
  type HomeFeedFilters,
} from '@/lib/home-feed-filters';
import { EXPLORE_FORMAT_OPTIONS } from '@/lib/explore-formats';
import type { QuizFormat } from '@/lib/quiz-format';
import {
  DISCOVERY_CAROUSEL_SIZE,
  type QuizFeedTabKind,
} from '@/lib/quiz-feed-cursor';
import { normalizeTag } from '@/services/quiz-validation';

export { DISCOVERY_CAROUSEL_SIZE };

export type SearchPlayStatus = 'all' | 'unplayed' | 'played';

export type SearchFeedTab = Exclude<QuizFeedTabKind, 'author'>;

export interface SearchUrlState {
  tab: SearchFeedTab;
  filters: HomeFeedFilters;
  openFilters: boolean;
  /** UI 専用。URL には `playStatus` として反映可 */
  playStatus: SearchPlayStatus;
}

const VALID_TABS = new Set<SearchFeedTab>(['latest', 'popular', 'trending', 'timeline']);
const VALID_PLAY_STATUS = new Set<SearchPlayStatus>(['all', 'unplayed', 'played']);
const VALID_FORMATS = new Set<string>(EXPLORE_FORMAT_OPTIONS.map((o) => o.id));

const DIFFICULTY_MIN = 1;
const DIFFICULTY_MAX = 5;
const QUESTIONS_MIN = 1;
const QUESTIONS_MAX = 50;

type SearchParamsInput =
  | URLSearchParams
  | Readonly<Record<string, string | string[] | undefined>>;

function getParam(params: SearchParamsInput, key: string): string | undefined {
  if (params instanceof URLSearchParams) {
    return params.get(key) ?? undefined;
  }
  const value = params[key];
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function clampInt(raw: string | undefined, min: number, max: number, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function parseTab(raw: string | undefined): SearchFeedTab {
  if (raw && VALID_TABS.has(raw as SearchFeedTab)) {
    return raw as SearchFeedTab;
  }
  return 'latest';
}

function parseFormat(raw: string | undefined): QuizFormat | '' {
  if (raw && VALID_FORMATS.has(raw)) {
    return raw as QuizFormat;
  }
  return '';
}

function parseTags(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  const normalized = raw
    .split(',')
    .map((part) => normalizeTag(part))
    .filter((tag) => tag.length > 0);
  return [...new Set(normalized)].sort();
}

function parsePlayStatus(raw: string | undefined): SearchPlayStatus {
  if (raw && VALID_PLAY_STATUS.has(raw as SearchPlayStatus)) {
    return raw as SearchPlayStatus;
  }
  return 'all';
}

function cloneDefaultFilters(): HomeFeedFilters {
  return {
    ...DEFAULT_HOME_FEED_FILTERS,
    tagChips: [...DEFAULT_HOME_FEED_FILTERS.tagChips],
  };
}

function normalizeDifficultyRange(min: number, max: number): Pick<HomeFeedFilters, 'difficultyMin' | 'difficultyMax'> {
  let difficultyMin = clampInt(String(min), DIFFICULTY_MIN, DIFFICULTY_MAX, DIFFICULTY_MIN);
  let difficultyMax = clampInt(String(max), DIFFICULTY_MIN, DIFFICULTY_MAX, DIFFICULTY_MAX);
  if (difficultyMin > difficultyMax) {
    [difficultyMin, difficultyMax] = [difficultyMax, difficultyMin];
  }
  return { difficultyMin, difficultyMax };
}

function normalizeQuestionRange(min: number, max: number): Pick<HomeFeedFilters, 'minQuestions' | 'maxQuestions'> {
  let minQuestions = clampInt(String(min), QUESTIONS_MIN, QUESTIONS_MAX, QUESTIONS_MIN);
  let maxQuestions = clampInt(String(max), QUESTIONS_MIN, QUESTIONS_MAX, QUESTIONS_MAX);
  if (minQuestions > maxQuestions) {
    [minQuestions, maxQuestions] = [maxQuestions, minQuestions];
  }
  return { minQuestions, maxQuestions };
}

export function parseSearchUrlState(params: SearchParamsInput): SearchUrlState {
  const difficultyMin = clampInt(
    getParam(params, 'difficultyMin'),
    DIFFICULTY_MIN,
    DIFFICULTY_MAX,
    DEFAULT_HOME_FEED_FILTERS.difficultyMin
  );
  const difficultyMax = clampInt(
    getParam(params, 'difficultyMax'),
    DIFFICULTY_MIN,
    DIFFICULTY_MAX,
    DEFAULT_HOME_FEED_FILTERS.difficultyMax
  );
  const minQuestions = clampInt(
    getParam(params, 'minQuestions'),
    QUESTIONS_MIN,
    QUESTIONS_MAX,
    DEFAULT_HOME_FEED_FILTERS.minQuestions
  );
  const maxQuestions = clampInt(
    getParam(params, 'maxQuestions'),
    QUESTIONS_MIN,
    QUESTIONS_MAX,
    DEFAULT_HOME_FEED_FILTERS.maxQuestions
  );

  const filters: HomeFeedFilters = {
    ...cloneDefaultFilters(),
    genreId: (getParam(params, 'genreId') ?? '').trim(),
    format: parseFormat(getParam(params, 'format')),
    searchQuery: (getParam(params, 'q') ?? '').trim(),
    tagChips: parseTags(getParam(params, 'tags')),
    ...normalizeDifficultyRange(difficultyMin, difficultyMax),
    ...normalizeQuestionRange(minQuestions, maxQuestions),
  };

  return {
    tab: parseTab(getParam(params, 'tab')),
    filters,
    openFilters: getParam(params, 'openFilters') === '1',
    playStatus: parsePlayStatus(getParam(params, 'playStatus')),
  };
}

function isDefaultDifficulty(filters: HomeFeedFilters): boolean {
  return (
    filters.difficultyMin === DEFAULT_HOME_FEED_FILTERS.difficultyMin &&
    filters.difficultyMax === DEFAULT_HOME_FEED_FILTERS.difficultyMax
  );
}

function isDefaultQuestionCount(filters: HomeFeedFilters): boolean {
  return (
    filters.minQuestions === DEFAULT_HOME_FEED_FILTERS.minQuestions &&
    filters.maxQuestions === DEFAULT_HOME_FEED_FILTERS.maxQuestions
  );
}

export function serializeSearchUrlState(state: SearchUrlState): URLSearchParams {
  const params = new URLSearchParams();
  const { filters } = state;

  if (state.tab !== 'latest') {
    params.set('tab', state.tab);
  }
  if (filters.genreId.trim()) {
    params.set('genreId', filters.genreId.trim());
  }
  if (filters.format) {
    params.set('format', filters.format);
  }
  if (filters.searchQuery.trim()) {
    params.set('q', filters.searchQuery.trim());
  }
  if (filters.tagChips.length > 0) {
    const tags = [...filters.tagChips].map((tag) => normalizeTag(tag)).filter(Boolean);
    const uniqueSorted = [...new Set(tags)].sort();
    if (uniqueSorted.length > 0) {
      params.set('tags', uniqueSorted.join(','));
    }
  }
  if (!isDefaultDifficulty(filters)) {
    params.set('difficultyMin', String(filters.difficultyMin));
    params.set('difficultyMax', String(filters.difficultyMax));
  }
  if (!isDefaultQuestionCount(filters)) {
    params.set('minQuestions', String(filters.minQuestions));
    params.set('maxQuestions', String(filters.maxQuestions));
  }
  if (state.playStatus !== 'all') {
    params.set('playStatus', state.playStatus);
  }
  if (state.openFilters) {
    params.set('openFilters', '1');
  }

  return params;
}

/** Next.js router 用: クエリ文字列（先頭 ? なし） */
export function buildSearchUrlQuery(state: Partial<SearchUrlState>): string {
  const merged: SearchUrlState = {
    tab: state.tab ?? 'latest',
    filters: {
      ...cloneDefaultFilters(),
      ...state.filters,
      tagChips: [...(state.filters?.tagChips ?? DEFAULT_HOME_FEED_FILTERS.tagChips)],
    },
    openFilters: state.openFilters ?? false,
    playStatus: state.playStatus ?? 'all',
  };
  return serializeSearchUrlState(merged).toString();
}
