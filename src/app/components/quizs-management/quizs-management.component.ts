import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TokenStorageService } from '../../service/token-storage/token-storage.service';
@Component({
  selector: 'app-quizs-management',
  templateUrl: './quizs-management.component.html',
  styleUrls: ['./quizs-management.component.css'],
})
export class QuizsManagementComponent implements OnInit {
  constructor(
    private tokenStorageService: TokenStorageService,
    private dialog: MatDialog
  ) {}
  role: string = '';
  quizs: any[] = [];
  ngOnInit() {
    const user = this.tokenStorageService.getUser() ?? { roles: [] };
    if (user?.roles?.includes('ROLE_ADMINISTRATOR'))
      this.role = 'ROLE_ADMINISTRATOR';
  }
}
