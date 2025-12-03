import { BrivoFilter, BrivoFilterItem, BrivoFilterOperator } from '@brivo/application';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export class FilterUtils {
  public static apply<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    filter: BrivoFilter,
    alias: string,
  ): SelectQueryBuilder<T> {
    if (filter.isEmpty()) {
      return queryBuilder;
    }

    for (const item of filter.getItems()) {
      FilterUtils.applyItem(queryBuilder, item, alias);
    }

    return queryBuilder;
  }

  private static applyItem<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    item: BrivoFilterItem,
    alias: string,
  ): void {
    const column = `${alias}.${item.field}`;
    const paramName = `${item.field}_${Date.now()}`;

    if (item.values.length === 1) {
      FilterUtils.applySingleValue(queryBuilder, column, item.operator, item.values[0]!, paramName);
    } else {
      FilterUtils.applyMultipleValues(queryBuilder, column, item.operator, item.values, paramName);
    }
  }

  private static applySingleValue<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    column: string,
    operator: BrivoFilterOperator,
    value: string | number | boolean,
    paramName: string,
  ): void {
    const conditions: Record<BrivoFilterOperator, string> = {
      eq: `${column} = :${paramName}`,
      ne: `${column} != :${paramName}`,
      gt: `${column} > :${paramName}`,
      lt: `${column} < :${paramName}`,
    };

    qb.andWhere(conditions[operator], { [paramName]: value });
  }

  private static applyMultipleValues<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    column: string,
    operator: BrivoFilterOperator,
    values: (string | number | boolean)[],
    paramName: string,
  ): void {
    if (operator === 'eq') {
      qb.andWhere(`${column} IN (:...${paramName})`, { [paramName]: values });
    } else if (operator === 'ne') {
      qb.andWhere(`${column} NOT IN (:...${paramName})`, { [paramName]: values });
    }
  }
}
