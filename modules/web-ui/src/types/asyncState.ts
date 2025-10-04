interface AsyncStateLoading<T> {
  isLoading: true;
  hasError: boolean;
  value: T | null;
}

interface AsyncStateSuccess<T> {
  isLoading: false;
  hasError: false;
  value: T;
}

interface AsyncStateFailure<T> {
  isLoading: false;
  hasError: true;
  value: T | null;
}

export type AsyncState<T> = AsyncStateLoading<T> | AsyncStateSuccess<T> | AsyncStateFailure<T>;
