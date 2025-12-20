import { Component, Inject, OnInit, OnDestroy } from '@angular/core';

import { TokenStorageService } from '../../service/token-storage/token-storage.service';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { LoadingService } from '../../service/loadingService';
import { delay, distinctUntilChanged } from 'rxjs/operators';
import { NotificationService } from '../../service/notification/notification.service';
import { Notifications } from '../../model/notifications';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css'],
})
export class MainMenuComponent implements OnInit, OnDestroy {
  private roles: string[];
  isLoggedIn = false;

  roleAdmin = false;
  roleProfessorOrAdmin = false;

  username: string;
  isLoading$ = this.loadingService.isLoading$.pipe(
    distinctUntilChanged(),
    delay(0) // 👈 đẩy change sang tick sau, hết ExpressionChanged
  );

  // Notification
  notifications: Notifications[] = [];
  unreadCount: number = 0;
  showNotificationDropdown = false;
  private notificationSubscription?: Subscription;
  private pollSubscription?: Subscription;

  constructor(
    private tokenStorageService: TokenStorageService,
    public dialog: MatDialog,
    private router: Router,
    public loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}
  isOpen = false;
  close() {
    this.isOpen = false;
  }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();

    if (this.isLoggedIn) {
      if (this.tokenStorageService.isTokenExpired()) {
        this.tokenStorageService.signOut();
        this.router.navigate(['/home']).then(() => {
          window.location.reload();
        });

        return;
      }
      const user = this.tokenStorageService.getUser();
      this.roles = user.roles;

      this.roleAdmin = this.roles.includes('ROLE_ADMINISTRATOR');
      this.roleProfessorOrAdmin = this.roles.includes('ROLE_ADMINISTRATOR');
      this.username = user.username;

      this.openNav();
      this.closeNav();

      var dropdown = document.getElementsByClassName('dropdown-btn');
      var i;

      for (i = 0; i < dropdown.length; i++) {
        dropdown[i].addEventListener('click', function () {
          this.classList.toggle('active');
          var dropdownContent = this.nextElementSibling;
          if (dropdownContent.style.display === 'block') {
            dropdownContent.style.display = 'none';
          } else {
            dropdownContent.style.display = 'block';
          }
        });
      }

      // Load notifications
      this.loadNotifications();
      this.loadUnreadCount();

      // Subscribe to unread count updates
      this.notificationSubscription =
        this.notificationService.unreadCount$.subscribe((count) => {
          this.unreadCount = count;
        });

      // Poll for new notifications every 30 seconds
      this.pollSubscription = interval(30000).subscribe(() => {
        this.loadUnreadCount();
      });
    } else {
      this.router.navigate(['home']);
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  loadNotifications(): void {
    this.notificationService.getAllNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        console.log('Loaded notifications:', data);
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
      },
    });
  }

  loadUnreadCount(): void {
    this.notificationService.countUnread().subscribe();
  }

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    if (this.showNotificationDropdown) {
      this.loadNotifications();
    }
  }

  closeNotificationDropdown(): void {
    this.showNotificationDropdown = false;
  }

  markAsRead(notification: Notifications): void {
    if (notification.status === 'UNREAD' && notification.id) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.status = 'READ';
        },
      });
    }
  }

  /**
   * Xử lý khi click vào notification - điều hướng đến nơi liên quan
   */
  onNotificationClick(notification: Notifications): void {
    // Đánh dấu đã đọc
    this.markAsRead(notification);

    // Đóng dropdown
    this.closeNotificationDropdown();

    console.log('Notification clicked:', notification);

    // Điều hướng dựa theo type
    if (notification.type === 'COMMENT_REPLY' && notification.courseId) {
      // Điều hướng đến course với lessonId trong query params
      const targetUrl = `/coursestable/${notification.courseId}`;
      const queryParams = notification.lessonId
        ? { lessonId: notification.lessonId, showComment: true, t: Date.now() }
        : { t: Date.now() };

      // Nếu đang ở route khác thì navigate bình thường
      // Nếu đang ở cùng course thì force reload
      if (this.router.url.startsWith(targetUrl)) {
        // Đang ở cùng course, cần reload
        this.router
          .navigateByUrl('/', { skipLocationChange: true })
          .then(() => {
            this.router.navigate(['/coursestable', notification.courseId], {
              queryParams,
            });
          });
      } else {
        this.router.navigate(['/coursestable', notification.courseId], {
          queryParams,
        });
      }
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.status = 'READ'));
      },
    });
  }

  deleteNotification(notification: Notifications, event: Event): void {
    event.stopPropagation();
    if (notification.id) {
      this.notificationService.deleteNotification(notification.id).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(
            (n) => n.id !== notification.id
          );
          if (notification.status === 'UNREAD') {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
        },
      });
    }
  }

  openNav() {}

  /* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
  closeNav() {}

  readNotifications(notifications: any) {}

  logout(): void {
    this.tokenStorageService.signOut();
    window.location.reload();
  }
}
