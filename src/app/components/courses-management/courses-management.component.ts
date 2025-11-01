import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '../../model/role';
import { RoleService } from '../../service/role/role.service';
import { TokenStorageService } from '../../service/token-storage/token-storage.service';

@Component({
  selector: 'app-courses-management',
  templateUrl: './courses-management.component.html',
  styleUrls: ['./courses-management.component.css'],
})
export class CoursesManagementComponent implements OnInit {
  constructor(
    private router: Router,
    private roleService: RoleService,
    private tokenStorageService: TokenStorageService
  ) {}
  roles: Role[] = [];

  role: string = '';
  ngOnInit(): void {
    const user = this.tokenStorageService.getUser();

    if (user.roles.includes('ROLE_ADMINISTRATOR')) {
      this.role = 'ROLE_ADMINISTRATOR';
    }

    this.roleService.getAll().subscribe((role) => {
      this.roles = role;
    });
  }
}
