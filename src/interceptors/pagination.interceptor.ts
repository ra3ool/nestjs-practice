import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaginatedResponse<T> {
  data: T;
  meta: {
    date: string;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

type RawPaginated<T> = {
  total: number;
  page: number;
  limit: number;
  invoices: T;
};

@Injectable()
export class PaginationInterceptor<T>
  implements NestInterceptor<T, PaginatedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<PaginatedResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (
          typeof response === 'object' &&
          response !== null &&
          'data' in response &&
          'meta' in response
        ) {
          return response as PaginatedResponse<T>;
        }

        const meta: PaginatedResponse<T>['meta'] = {
          date: new Date().toISOString(),
        };

        function isPaginatedResponse(obj: unknown): obj is RawPaginated<T> {
          if (typeof obj !== 'object' || obj === null) {
            return false;
          }
          const o = obj as {
            total?: unknown;
            page?: unknown;
            limit?: unknown;
            invoices?: unknown;
          };
          return (
            typeof o.total === 'number' &&
            typeof o.page === 'number' &&
            typeof o.limit === 'number' &&
            'invoices' in o
          );
        }

        if (isPaginatedResponse(response)) {
          meta.pagination = {
            total: response.total,
            page: response.page,
            limit: response.limit,
            totalPages: Math.ceil(response.total / response.limit),
          };
          return { data: response.invoices, meta };
        }

        if (typeof response === 'object' && response !== null) {
          return { data: response as T, meta };
        }
        return { data: response as T, meta };
      }),
    );
  }
}
