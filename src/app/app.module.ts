import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { NgxNotificationMsgModule } from 'ngx-notification-msg';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';

import { AppComponent } from './app.component';
import { authInterceptorProviders } from './helper/auth.interceptor';
import { LoginComponent } from './components/home/login/login.component';
import { RegisterComponent } from './components/home/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/main-menu/profile/profile.component';
import { BoardAdminComponent } from './components/main-menu/board-admin/board-admin.component';
import { UsersManagementComponent } from './components/users-management/users-management-table.component';
import { CreateEditUserComponent } from './components/users-management/create-edit-user/create-edit-user.component';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { CoursesManagementComponent } from './components/courses-management/courses-management.component';
import { AddCourseComponent } from './components/courses-management/add-course/add-course.component';
import { DetailCourseComponent } from './components/courses-management/detail-course/detail-course.component';
import { AddLessonComponent } from './components/courses-management/detail-course/add-lesson/add-lesson.component';
import { CommentLessonComponent } from './components/courses-management/detail-course/comment-lesson/comment-lesson.component';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { QuizsManagementComponent } from './components/quizs-management/quizs-management.component';
import { AddQuizComponent } from './components/quizs-management/add-quiz/add-quiz.component';
import { DetailQuizComponent } from './components/quizs-management/detail-quiz/detail-quiz.component';
import { LoadingService } from './service/loadingService';
import { LoadingInterceptor } from './helper/Loading.interceptor';
import { CommonModule } from '@angular/common';
import { AddQuestionComponent } from './components/quizs-management/detail-quiz/add-question/add-question.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ProfileComponent,
    BoardAdminComponent,
    CreateEditUserComponent,
    MainMenuComponent,
    UsersManagementComponent,
    CreateEditUserComponent,
    CoursesManagementComponent,
    AddCourseComponent,
    DetailCourseComponent,
    AddLessonComponent,
    CommentLessonComponent,
    QuizsManagementComponent,
    AddQuizComponent,
    DetailQuizComponent,
    AddQuestionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatTableModule,
    BrowserAnimationsModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatDatepickerModule,
    MatMenuModule,
    MatSortModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatCardModule,
    MatCheckboxModule,
    RouterModule,
    NgxNotificationMsgModule,
    MatDialogModule,
    MatBadgeModule,
    MatListModule,
    MatSidenavModule,
    CommonModule,
      
  ],
  providers: [
    authInterceptorProviders,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
