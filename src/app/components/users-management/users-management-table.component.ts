import { Component, OnInit } from '@angular/core';
import { User } from '../../model/user';
// import { History } from '../../model/history';
import { UserService } from '../../service/user/user.service';
// import { HistoryService } from 'src/app/service/history/history.service';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { Role } from '../../model/role';
import { RoleService } from '../../service/role/role.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { TokenStorageService } from '../../service/token-storage/token-storage.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-users-management-table',
  templateUrl: './users-management-table.component.html',
  styleUrls: ['./users-management-table.component.css'],
})
export class UsersManagementComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  users: User[] = [];
  roles: Role[] = [];
  us: User;

  role: string = '';

  pageStart: boolean = true;
  myControl = new FormControl();
  filteredOptions: Observable<User[]> | undefined;

  displayedColumns: string[] = [
    'select',
    'id',
    'name',
    'surname',
    'username',
    'email',
    'roles',
    'actions',
  ];
  dataSource: MatTableDataSource<User>;
  TotalRow: number;
  selection = new SelectionModel<User>(true, []);

  //Paras for get all users from server side
  pageNo: number = 0;
  total: number = 0;
  pageSize: number = 5;
  pageSizeOptions: number[] = [5, 10, 20];
  sortBy: string = 'id';

  //SEARCH
  searchName: string = '';
  searchSurname: string = '';
  searchRoleID: string = '';

  history: History[] = [];
  service: any[] = [];

  student: any;
  test: any[] = [];
  e: any[] = [];

  adresa: any;
  city: String;
  steet: String;
  country: String;

  bodovi: number = 0;
  ocena: number = 0;

  upisi: any[] = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private roleService: RoleService,
    private tokenStorageService: TokenStorageService
  ) {}

  formHistory: FormGroup = new FormGroup({
    id: new FormControl(null),
    user: new FormControl(null),
    enroll: new FormControl(null),
  });

  ngOnInit(): void {
    const user = this.tokenStorageService.getUser();

    if (user.roles.includes('ROLE_ADMINISTRATOR')) {
      this.role = 'ROLE_ADMINISTRATOR';
    }

    this.roleService.getAll().subscribe((role) => {
      this.roles = role;
    });

    //autocomplete search
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );

    this.refreshTable();
  }

  hide() {}

  selectForChange(user: User) {
    this.router.navigate([
      'userstable/createedituser',
      { userForChange: JSON.stringify(user) },
    ]);
  }

  addNewUser() {
    this.router.navigate(['userstable/createedituser']);
  }

  page(event: Event) {
    this.pageNo = event['pageIndex'];
    this.pageSize = event['pageSize'];
    this.refreshTable();
  }

  refreshTable() {
    this.userService
      .getAll(
        this.pageNo,
        this.pageSize,
        this.sortBy,
        this.searchName,
        this.searchSurname,
        this.searchRoleID
      )
      .subscribe((newUsers) => {
        this.users = newUsers;
        console.log(newUsers);
        this.dataSource = new MatTableDataSource(newUsers.slice());
        this.dataSource.sort = this.sort;
      });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = !!this.dataSource && this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((r) => this.selection.select(r));
  }

  checkboxLabel(row: User): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
    }`;
  }

  delete() {
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      if (confirm('Bạn có chắc chắn muốn xóa các mục đã chọn?')) {
        for (let object of numSelected) {
          this.userService.delete(object.id).subscribe((x) => {
            this.refreshTable();
            this.selection.clear();
          });
        }
      }
    } else {
      alert('Lỗi: vui lòng chọn ít nhất một hàng!');
    }
  }

  ///// AUTOCOMPLETE /////
  displayUser(user: string) {
    return user ? user : undefined;
  }

  private _filter(value: string): User[] {
    if (this.pageStart == true) {
      this.pageStart = false;
    } else {
      let filterValues: string[] = value.toLowerCase().split(' ');
      this.searchName = filterValues[0]; // Dodeljujemo ima iz prvog indeksa nakon splitovanja

      if (filterValues[1] != undefined && filterValues[1] != '') {
        this.searchSurname = filterValues[1];
      } else {
        this.searchSurname = '';
      }
      this.refreshTable();
    }
    const filterValue = value.toString().toLowerCase();
    return this.users.filter(
      (user: {
        name: { toString: () => string };
        surname: { toString: () => string };
      }) =>
        user.name.toString().toLowerCase().includes(filterValue) ||
        user.surname.toString().toLowerCase().includes(filterValue)
    );
  }

  selectedRole(role: string) {
    this.searchRoleID = role;
    this.refreshTable();
  }

  resetSearch() {
    if (this.role == 'ROLE_ADMINISTRATOR') {
      this.searchRoleID = '';
    }
    this.myControl.setValue('');
    this.searchName = '';
    this.searchSurname = '';
    this.refreshTable();
  }
}
