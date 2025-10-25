import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/home/login/login.component';
import { RegisterComponent } from './components/home/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/main-menu/profile/profile.component';
import { BoardAdminComponent } from './components/main-menu/board-admin/board-admin.component';
// import { BoardModeratorComponent } from './components/main-menu/board-moderator/board-moderator.component';
import { BoardUserComponent } from './components/main-menu/board-user/board-user.component';
// import { PickSubjectComponent } from './components/main-menu/board-user/pick-subject/pick-subject.component';
import { CreateEditUserComponent } from './components/users-management/create-edit-user/create-edit-user.component';
import { UsersManagementComponent } from './components/users-management/users-management-table.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'user', component: BoardUserComponent },
  // { path: 'user/picksubject', component: PickSubjectComponent },
  // { path: 'professor', component: BoardModeratorComponent },
  { path: 'administrator', component: BoardAdminComponent },
  { path: 'userstable', component: UsersManagementComponent },
  { path: 'userstable/createedituser', component: CreateEditUserComponent },

  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
