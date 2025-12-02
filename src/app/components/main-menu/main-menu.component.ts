import { Component, Inject, OnInit } from '@angular/core';

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

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css'],
})
export class MainMenuComponent implements OnInit {
  private roles: string[];
  isLoggedIn = false;

  roleAdmin = false;
  roleProfessorOrAdmin = false;

  username: string;
  isLoading$ = this.loadingService.isLoading$.pipe(
    distinctUntilChanged(),
    delay(0) // 👈 đẩy change sang tick sau, hết ExpressionChanged
  );
  constructor(
    private tokenStorageService: TokenStorageService,
    public dialog: MatDialog,
    private router: Router,
    public loadingService: LoadingService
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
    } else {
      this.router.navigate(['home']);
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
