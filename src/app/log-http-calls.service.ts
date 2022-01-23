import { Injectable } from '@angular/core';
import { finalize, } from 'rxjs/operators';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class LogHttpCallsService implements HttpInterceptor {

  constructor(private _s: SharedService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // extend server response observable with logging
    return next.handle(req)
      .pipe(
        // Log when response observable either completes or errors
        finalize(() => {
          this._s.isLoading.next(false);
        })
      );
  }
}
