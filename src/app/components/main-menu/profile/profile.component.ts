import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../model/user';
import { TokenStorageService } from '../../../service/token-storage/token-storage.service';
import { UserService } from '../../../service/user/user.service';
import { City, Country } from 'country-state-city';
import { Router } from '@angular/router';
import { NgxNotificationDirection, NgxNotificationMsgService, NgxNotificationStatusMsg } from 'ngx-notification-msg';
import { Adress } from '../../../model/adress';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: User;
  userAdress: Adress;
  roles: String[] = [];
  kliknut = false;
  lozinka: String = '';

  //address
  countrys : String[] = [];
  citys : String[] = [];

  full : boolean;
  isFailed = false;
  errorMessage = '';

  formCreateEditUser : FormGroup = new FormGroup({
    "id" : new FormControl(null),
    "email" : new FormControl(null, [Validators.required]),
    "name" : new FormControl(null, [Validators.required]),
    "password" : new FormControl(null, [Validators.required]),
    "surname" : new FormControl(null, [Validators.required]),
    "username" : new FormControl(null, [Validators.required]),
    "roles" : new FormControl(null),
  });


  constructor(private token: TokenStorageService, public us: UserService,
    private router: Router, private readonly ngxNotificationMsgService: NgxNotificationMsgService) { }

  ngOnInit(): void {
    const currentUser = this.token.getUser();


    this.us.getOne(currentUser.username).subscribe((user : User) => {
      console.log(user)
      this.user = user
      this.formCreateEditUser.patchValue(user);
      for(let role of user.roles){
        if(role.name.toString() == "ROLE_ADMINISTRATOR"){ this.roles.push("Administrator"); } 
        else if(role.name.toString() == "ROLE_USER"){ this.roles.push("User"); } 
        else { this.roles.push(role.name.toString());}
      }

     
      
    });
  };

  saveUser(){
    if(this.formCreateEditUser.valid){
      if(this.lozinka != null) { this.formCreateEditUser.patchValue({["password"] : this.lozinka}); } // Kada unese novu lozinku polje vise nije prazno i setujemo novu lozinku u formu
      
      //Logout when user change username
      if(this.formCreateEditUser.value["username"] != this.user.username ){
        this.us.update(this.formCreateEditUser.value.id, this.formCreateEditUser.value).subscribe(x => {
          this.token.signOut();
          window.location.href="login"
        });
      } else {
        this.us.update(this.formCreateEditUser.value.id, this.formCreateEditUser.value).subscribe(x => {
          this.us.getOne(this.user.username).subscribe((user : User) => {
            this.user = user;
            this.formCreateEditUser.patchValue(user);
            this.ngxNotificationMsgService.open({
              status: NgxNotificationStatusMsg.SUCCESS,
              header: 'Cập nhật hồ sơ',
              messages: ['Bạn đã cập nhật hồ sơ thành công.'],
              direction: NgxNotificationDirection.BOTTOM_RIGHT
            });
          });
        });
      }

     
      
    } else {
      this.errorMessage = "You can fill in all fields, where star!";
      this.isFailed = true;
    }
  };



  checkU(){
    // if(this.formCreateEditUser.get("username").valid == true){
    //   this.us.checkUsername(this.formCreateEditUser.value.username, this.formCreateEditUser.value.id).subscribe(data => {
    //     this.isFailed = false;
    //     this.formCreateEditUser.controls.username.setErrors(null);
    //   }, err => {
    //     this.formCreateEditUser.controls.username.setErrors({'incorrect': true});
    //     this.errorMessage = err.error.message;
    //     this.isFailed = true;
    //   });
    // }
  }

  checkEmail(){
    // if(this.formCreateEditUser.get("email").valid == true){
    //   this.us.checkEmail(this.formCreateEditUser.value.email, this.formCreateEditUser.value.id).subscribe(data => {
    //     this.isFailed = false;
    //     this.formCreateEditUser.controls.email.setErrors(null);
    //   }, err => {
    //     this.formCreateEditUser.controls.email.setErrors({'incorrect': true});
    //     this.errorMessage = err.error.message;
    //     this.isFailed = true;
    //   });
    // }
  }

  details(){
    this.kliknut = true;
    this.myFunction();
  }
  
  hideDet(){
    this.kliknut = false;
  }
  
  myFunction() {
    var x = document.getElementById("snackbar");
    // x.className = "show";
    // setTimeout(function(){ x.className = x.className.replace("show", ""); }, 7000);
  }

}