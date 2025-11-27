export const BRIVO_FILTER_OPERATORS = ['eq', 'ne', 'gt', 'lt'] as const;

export type BrivoFilterOperator = (typeof BRIVO_FILTER_OPERATORS)[number];

export interface BrivoFilterItem {
  operator: BrivoFilterOperator;
  field: string;
  values: (string | number | boolean)[];
}

export class BrivoFilter {
  private readonly items: BrivoFilterItem[] = [];

  constructor() {}

  public add(item: BrivoFilterItem): this {
    this.items.push(item);
    return this;
  }

  public getItems(): BrivoFilterItem[] {
    return this.items;
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  public toQueryString(): string {
    if (this.items.length === 0) return '';

    return this.items
      .map((c) => {
        const value = c.values.map((v) => String(v)).join(',');
        return `${c.field}__${c.operator}:${value}`;
      })
      .join(';');
  }
}
