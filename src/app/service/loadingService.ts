import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this._isLoading$.asObservable();

  private pendingRequests = 0;

  show() {
    this.pendingRequests++;
    if (this.pendingRequests === 1) {
      this._isLoading$.next(true);
    }
  }

  hide() {
    if (this.pendingRequests === 0) return;

    this.pendingRequests--;
    if (this.pendingRequests === 0) {
      this._isLoading$.next(false);
    }
  }
}
