import { Component, Inject, OnInit } from '@angular/core';
// import { SubjectNotifications } from 'src/app/model/subject-notifications';
// import { FollowService } from 'src/app/service/follow-sub/follow.service';
import { TokenStorageService } from '../../service/token-storage/token-storage.service';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { SubjectNotificationsDialog } from './board-moderator/about-subject/about-subject.component';
// import { StudentService } from 'src/app/service/student/student.service';
// import { Student } from 'src/app/model/student';
// import { ForumService } from 'src/app/service/forum/forum/forum.service';
// import { Forum } from 'src/app/model/forum/forum';
// import { Podforum } from 'src/app/model/forum/podforum';
import { Router } from '@angular/router';

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
  roleProfessorOnly = false;
  roleStudent = false;

  username: string;

  subjectNotifications: any[] = [];
  student: any = null;

  forum: any = null;

  constructor(
    private tokenStorageService: TokenStorageService,
    public dialog: MatDialog,
    private router: Router
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

  openNav() {
    // document.getElementById("mySidebar").style.width = "250px";
    // document.getElementById("main").style.marginLeft = "250px";
  }

  /* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
  closeNav() {
    // document.getElementById("mySidebar").style.width = "0";
    // document.getElementById("main").style.marginLeft = "0";
  }

  readNotifications(notifications: any) {
    this.subjectNotifications.forEach((value, index) => {
      if (value['id'] == notifications['id'])
        this.subjectNotifications.splice(index, 1);
    }); //Izbacujemo iz liste notifikaciju koju smo otvorili
  }

  logout(): void {
    this.tokenStorageService.signOut();
    window.location.reload();
  }
}
