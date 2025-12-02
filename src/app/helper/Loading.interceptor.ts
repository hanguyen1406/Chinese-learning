import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../service/loadingService';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Debug thử
    console.log('[LoadingInterceptor] start:', req.url);
    this.loadingService.show();

    return next.handle(req).pipe(
      finalize(() => {
        console.log('[LoadingInterceptor] end:', req.url);
        this.loadingService.hide();
      })
    );
  }
}
