import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user/user.service';
import { Router } from '@angular/router';
import { TokenStorageService } from 'src/app/service/token-storage/token-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
    private tokenStorageService: TokenStorageService
  ) {}

  ngOnInit(): void {}
  ionViewDidLoad() {
    setTimeout(() => {
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }, 0);
  }
  show(nus: any): void {
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 50);
  }
  openStart() {
    const user = this.tokenStorageService.getUser() ?? { roles: [] };
    if (user.roles.length > 0) {
      this.router.navigate(['/coursestable']);
    } else {
      this.router.navigate(['/register']);
    }
  }
  about(object: any) {
    console.log(object);
    this.router.navigate(
      ['/detailed', { objDetails: JSON.stringify(object) }],
      { queryParams: object, skipLocationChange: true }
    );
  }
}
