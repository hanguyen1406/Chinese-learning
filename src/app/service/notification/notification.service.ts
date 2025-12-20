import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Notifications } from '../../model/notifications';
import { API_PATH } from '../const';

const API_URL = `${API_PATH}/notification`;

// Header để skip loading spinner
const SKIP_LOADING_HEADERS = new HttpHeaders().set('X-Skip-Loading', 'true');

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Lấy tất cả thông báo
   */
  getAllNotifications(): Observable<Notifications[]> {
    return this.http.get<Notifications[]>(API_URL, {
      headers: SKIP_LOADING_HEADERS,
    });
  }

  /**
   * Lấy thông báo chưa đọc
   */
  getUnreadNotifications(): Observable<Notifications[]> {
    return this.http.get<Notifications[]>(`${API_URL}/unread`, {
      headers: SKIP_LOADING_HEADERS,
    });
  }

  /**
   * Đếm số thông báo chưa đọc
   */
  countUnread(): Observable<number> {
    return this.http
      .get<number>(`${API_URL}/count-unread`, {
        headers: SKIP_LOADING_HEADERS,
      })
      .pipe(
        tap((count) => {
          this.unreadCountSubject.next(count);
        })
      );
  }

  /**
   * Cập nhật số thông báo chưa đọc (gọi từ component)
   */
  refreshUnreadCount(): void {
    this.countUnread().subscribe();
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead(): Observable<any> {
    return this.http.put(`${API_URL}/mark-all-read`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      })
    );
  }

  /**
   * Đánh dấu 1 thông báo đã đọc
   */
  markAsRead(id: number): Observable<any> {
    return this.http.put(`${API_URL}/mark-read/${id}`, {}).pipe(
      tap(() => {
        const currentCount = this.unreadCountSubject.value;
        if (currentCount > 0) {
          this.unreadCountSubject.next(currentCount - 1);
        }
      })
    );
  }

  /**
   * Xóa thông báo
   */
  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }
}
