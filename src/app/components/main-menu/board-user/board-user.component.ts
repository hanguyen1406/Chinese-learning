import { Component, OnInit } from '@angular/core';
// import { University } from 'src/app/model/university';
// import { StudentServiceService } from 'src/app/service/student-service/student-service.service';
import { TokenStorageService } from '../../../service/token-storage/token-storage.service';
import { UserService } from '../../../service/user/user.service';
// import { StudentService } from 'src/app/model/student-service';
import { FormControl, FormGroup } from '@angular/forms';
// import { Subject } from 'src/app/model/subject';
// import { FollowService } from 'src/app/service/follow-sub/follow.service';
// import { followSub } from 'src/app/model/followSub';
// import { Topic } from 'src/app/model/topic';
// import { TOUCH_BUFFER_MS } from '@angular/cdk/a11y';
// import { User } from 'src/app/model/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board-user',
  templateUrl: './board-user.component.html',
  styleUrls: ['./board-user.component.css'],
})
export class BoardUserComponent implements OnInit {
  content: string;
  currentUser: any;
  uni: any[] = [];
  username: string = '';
  subjects: any[] = [];
  s: any[] = [];
  topic: any[] = [];
  tema = false;
  user: any[] = [];

  constructor(
    private tokenStorageService: TokenStorageService,
    private userService: UserService,
    private token: TokenStorageService,
    public us: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.tokenStorageService.getUser();

    if (user.roles.includes('ROLE_STUDENT')) {
      this.username = user.username;

      this.us.getOne(this.username).subscribe((user: any) => {
        console.log(user);
        // this.sub.getSubjects(this.username).subscribe((value: any[]) => {
        //   this.subjects = value;
        //   //console.log(value)

        //   for (let p of value) {
        //     if (p.choosed == false) {
        //       this.openNav();
        //       //console.log(p)
        //     }
        //   }
        // });
        //DOBAVLJANJE PREDMETA KOJE JE STUDENT IZABRAO
        // this.follow.getSubjects(user.id).subscribe((v: any[]) => {
        //   console.log(v);
        //   for (let p of v) {
        //     for (let predmet of p.subjects) {
        //       this.s.push(predmet);
        //     }

        //     console.log('PREDMETI KOJE STUDENT PRATI: ', this.s);
        //   }
        // });
      });
    }
  }
  about(subject: any) {
    this.router.navigate([
      'user/subjectdetails',
      { subforchange: JSON.stringify(subject) },
    ]);
  }
  openNav() {
    // document.getElementById("myNav").style.height = "100%";
  }

  closeNav() {
    // document.getElementById("myNav").style.height = "0%";
  }
}
