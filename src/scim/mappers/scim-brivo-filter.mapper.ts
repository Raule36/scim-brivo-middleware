import { BRIVO_FILTER_OPERATORS, BrivoFilter, BrivoFilterOperator } from '@brivo/interfaces';
import { Injectable, Logger } from '@nestjs/common';
import { Compare, Filter, parse } from 'scim2-parse-filter';

type ScimToBrivoFieldMapping = {
  brivoField: string;
  supportedOperators: BrivoFilterOperator[];
  transformValue?: (value: string | number | boolean) => string | number | boolean;
};

const SCIM_TO_BRIVO_USER_FIELDS: Record<string, ScimToBrivoFieldMapping> = {
  'id': {
    brivoField: 'id',
    supportedOperators: ['eq', 'ne'],
  },
  'name.givenName': {
    brivoField: 'firstName',
    supportedOperators: ['eq'],
  },
  'name.familyName': {
    brivoField: 'lastName',
    supportedOperators: ['eq'],
  },
  'active': {
    brivoField: 'user_status',
    supportedOperators: ['eq'],
    transformValue: (value) => (value === true || value === 'true' ? 'active' : 'suspended'),
  },
  'userName': {
    brivoField: 'externalId',
    supportedOperators: ['eq'],
  },
  'externalId': {
    brivoField: 'externalId',
    supportedOperators: ['eq'],
  },
};

@Injectable()
export class ScimBrivoFilterMapper {
  private readonly logger = new Logger(ScimBrivoFilterMapper.name);

  public mapFromString(stringFilter?: string): BrivoFilter {
    const brivoFilter = new BrivoFilter();

    if (!stringFilter) {
      return brivoFilter;
    }

    try {
      const parsed: Filter = parse(stringFilter);
      this.processFilter(parsed, brivoFilter);
    } catch (error) {
      this.logger.warn(
        `Failed to parse SCIM filter: ${stringFilter}, error: ${(error as Error).message}`,
      );
    }

    return brivoFilter;
  }

  private processFilter(filter: Filter, brivoFilter: BrivoFilter): void {
    if (filter.op === 'and') {
      filter.filters.forEach((child) => {
        this.processFilter(child, brivoFilter);
      });
      return;
    }

    if (this.isCompareOperation(filter.op)) {
      this.processCompare(filter as Compare, brivoFilter, filter.op);
    } else {
      this.logger.warn(`Unsupported SCIM filter operation: ${filter.op}`);
    }
  }

  private processCompare(
    compare: Compare,
    filter: BrivoFilter,
    operator: BrivoFilterOperator,
  ): void {
    const mapping = SCIM_TO_BRIVO_USER_FIELDS[compare.attrPath];

    if (!mapping) {
      this.logger.warn(
        `SCIM attribute "${compare.attrPath}" is not supported for Brivo Users filter`,
      );
      return;
    }

    const rawValue = compare.compValue as string | number | boolean;
    const transformedValue = mapping.transformValue ? mapping.transformValue(rawValue) : rawValue;

    filter.add({
      field: mapping.brivoField,
      operator,
      values: [transformedValue],
    });
  }

  private isCompareOperation(op: string): op is BrivoFilterOperator {
    return BRIVO_FILTER_OPERATORS.includes(op as BrivoFilterOperator);
  }
}
