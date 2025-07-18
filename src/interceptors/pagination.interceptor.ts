import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
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

// Define a type for the expected paginated response structure
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
        // If response is already in PaginatedResponse format, return it as-is to prevent nesting
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

        // Type guard for paginated response without using 'any'
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

        // Handle paginated response (e.g., from getAllInvoices)
        if (isPaginatedResponse(response)) {
          meta.pagination = {
            total: response.total,
            page: response.page,
            limit: response.limit,
            totalPages: Math.ceil(response.total / response.limit),
          };
          return { data: response.invoices, meta };
        }

        // Handle non-paginated response (e.g., single invoice)
        // Try to avoid unsafe assignment by narrowing type
        if (typeof response === 'object' && response !== null) {
          return { data: response as T, meta };
        }
        // For primitives, wrap as data
        return { data: response as T, meta };
      }),
    );
  }
}
