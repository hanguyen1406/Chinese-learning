import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ERole } from '../../../model/role';
// import { FacultyService } from 'src/app/service/faculty/faculty.service';
// import { ProfessorService } from 'src/app/service/professor/professor.service';
import { RoleService } from '../../../service/role/role.service';
// import { StudentService } from 'src/app/service/student/student.service';
// import { UniversityService } from 'src/app/service/university/university.service';
import { UserService } from '../../../service/user/user.service';

@Component({
  selector: 'app-board-admin',
  templateUrl: './board-admin.component.html',
  styleUrls: ['./board-admin.component.css'],
})
export class BoardAdminComponent implements OnInit {
  countUsers: number = 0;
  countQuiz: number = 0;
  countCourses: number = 0;

  constructor(
    private router: Router,
    private userService: UserService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {}
  ngAfterViewInit() {
    this.userService.countUser('', '', '').subscribe((x: any) => {
      this.countUsers = x;
    });
  }
}
