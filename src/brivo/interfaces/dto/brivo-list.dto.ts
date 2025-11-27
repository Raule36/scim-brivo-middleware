export interface BrivoListDto<T> {
  data: T[];
  offset: number;
  pageSize: number;
  count: number;
}
