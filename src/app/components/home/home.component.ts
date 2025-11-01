import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(private userService: UserService, private router: Router) {}

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

  about(object: any) {
    console.log(object);
    this.router.navigate(
      ['/detailed', { objDetails: JSON.stringify(object) }],
      { queryParams: object, skipLocationChange: true }
    );
  }
}
