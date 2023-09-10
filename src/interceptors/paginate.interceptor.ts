import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Pagination } from '../types';

@Injectable()
export class PaginateInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Observable<Pagination> {
    const request = context.switchToHttp().getRequest();

    if (request.query) {
      request.query = {
        ...request.query,
        offset: Number(request.query.offset || 0),
        limit: Number(request.query.limit || 10),
      };
    }

    const { offset, limit } = request.query;

    return handler.handle().pipe(
      map((response) => {
        let { data, count } = response;

        data = data ?? [];
        count = count ?? 0;

        const nextOffset = offset + limit;

        const previous =
          offset === 0 ? null : { offset: offset - limit, limit };

        const next =
          nextOffset >= count
            ? null
            : {
                offset: nextOffset,
                limit: limit,
              };

        return {
          count: count,
          previous: count === 0 ? null : previous,
          next: count === 0 ? null : next,
          results: data,
        };
      }),
    );
  }
}
