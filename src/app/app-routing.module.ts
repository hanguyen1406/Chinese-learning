import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/home/login/login.component';
import { RegisterComponent } from './components/home/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/main-menu/profile/profile.component';
import { BoardAdminComponent } from './components/main-menu/board-admin/board-admin.component';
import { CreateEditUserComponent } from './components/users-management/create-edit-user/create-edit-user.component';
import { UsersManagementComponent } from './components/users-management/users-management-table.component';
import { CoursesManagementComponent } from './components/courses-management/courses-management.component';
import { DetailCourseComponent } from './components/courses-management/detail-course/detail-course.component';
import { QuizsManagementComponent } from './components/quizs-management/quizs-management.component';
import { DetailQuizComponent } from './components/quizs-management/detail-quiz/detail-quiz.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'administrator', component: BoardAdminComponent },
  { path: 'userstable', component: UsersManagementComponent },
  { path: 'coursestable', component: CoursesManagementComponent },
  { path: 'quizs', component: QuizsManagementComponent },
  { path: 'quizs/:idQuiz', component: DetailQuizComponent },
  { path: 'coursestable/:idCourse', component: DetailCourseComponent },
  { path: 'userstable/createedituser', component: CreateEditUserComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top', // 👈 Tự cuộn lên đầu
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
