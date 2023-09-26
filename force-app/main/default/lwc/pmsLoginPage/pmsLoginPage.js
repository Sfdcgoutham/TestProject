import { LightningElement,api,track,wire} from 'lwc';
import {
    getSessionParameter
} from './sessionManager';
import myResource from '@salesforce/resourceUrl/CloudtaruLogo';
import myResourceKriya from '@salesforce/resourceUrl/Kriyalogo';

import myResource1 from '@salesforce/resourceUrl/loginbg';
import checkusername from '@salesforce/apex/appframeowrkcls.checkUsername';
import validateSession from '@salesforce/apex/appframeowrkcls.validateSession';
import tabobjsvisibility from '@salesforce/apex/custom_framework_tab.tabobjsvisibility';
import sessionmethod from '@salesforce/apex/appframeowrkcls.sessionmethod';
import getSessionExpTime from '@salesforce/apex/appframeowrkcls.getSessionExpTime';
import labelName from '@salesforce/label/c.Store_the_tab_names_of';

import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import sendotp from '@salesforce/apex/appframeowrkcls.sendotp';

export default class PmsLoginPage extends LightningElement {
    spinner = false;
    tabLabel = labelName;
    @track otp;
    @track otpcheck;
    @track username=null;
    @track userRole;
    @track role;
    userid2;
    userid1;
    flagvariable = false;
    @track isLoading = false;
    @track userid2;
    @track puid1;
    @track puName1;
    @track Managerid1;
    @track Managerid;
    @track Manageremail;
    @track Manageremail1;
    @track username1;
    @track userrole1
    usernameCookies;
    userroleCookies;
    useridcookies;
    puidcookies;
    puNamecookies;
    manageremail1cookies;
    Managerid1cookies;
    @track logincontacts;
    cou;
    @track sessionlist;
    @track logintime;
    @track payroll;
    @track payroll1;
    @api role;
    // @api empid;
    @api puid;
    @api puName;
    @track Managerid;
    @track x;
    @track y;
    @track times;
    @track att = false;
    @track otppage = false;
    @track login = true;
    @api selectedItemValue;
    ename;
    errormsg = false;
    logingbg = myResource1;
    cloudtarulogo = myResource;
    Kriyalogo = myResourceKriya;
    stageName = 'Employee Login';
    @track errormsg2=false;
   
    sessExp = false;
    @track pmstemplate = false;

     sessExpTime=0;
     @track stageOTP = false;


    usernamehandler(Event) {
       var uname = Event.target.value;
				this.username=uname.trim();
				console.log(this.username);
    }
    sendotphandler() {
				if(this.username!=null ){
 				this.spinner=true;
        checkusername({
                username: this.username
            })
            .then(results => {
                if (results.length > 0) {
                    console.log('result');
                    console.log(results);
                    console.log(JSON.stringify(results));
 	                this.spinner=false;
                    this.userRole = results[1];
                    this.ename = results[0];
                    this.userid1 = results[2];
                    this.puid = results[3];
                    // alert(this.userRole);
                    this.puName = results[4];
                    // alert(this.puName);
                    this.Managerid = results[5];
                    // alert(this.Managerid);
                    this.Manageremail = results[6];
                    // alert(this.Manageremail);

                    sendotp({
                            username: this.username
                        })
                        .then(data => {
                             this.spinner=false;
                            this.otpcheck = data;
                            console.log(this.otpcheck);
                            //this.login = false;
                          // this.otppage = true;
                           this.stageOTP=true;
                           this.stageName='ENTER OTP'
                           console.log('stageOTP'+this.stageOTP);
                            this.att = false;
                            this.dispatchEvent(new ShowToastEvent({
                                title: 'Mail has sent to ' + this.ename,
                                message: 'Please Check the Mail',
                                variant: 'success',
                                mode: 'pester'
                            }), );

                        })

                } else {
                    this.spinner = false;
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Oh! Login Failed',
                        message: 'Please Check the username',
                        variant: 'error',
                        mode: 'pester'
                    }), );
                }

            })
		}
				else{
						 this.dispatchEvent(new ShowToastEvent({
                        title: 'Warning',
                        message: 'Please Enter the username',
                        variant: 'Warning',
                        mode: 'pester'
                    }), );
				}
    }
    closelogin() {
        this.otppage = false;
        this.login = true;
        this.username = null;
				this.errormsg = false;
				this.otp='';
    }
    otphandler(Event) {
        this.otp = Event.target.value;
    }
    loginhandleChange(Event) {
        if (Event.target.name == 'username') {
            this.username = Event.target.value;
						
        }
    }


    setCookie(cname, cvalue, exdays) {
        // alert('s');
        // alert('cname' + cname);
        // alert('cvalue' + cvalue);
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 1000));
        let expires = "expires=" + d.toGMTString();
        //   document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        //   document.cookie = "userRole" + "=" +  this.userroleCookies + ";" + expires + ";path=/";
    }

   // idleLogoutRef = this.idleLogout.bind(this);

    connectedCallback() {
       
        
        this.username = getSessionParameter('userName');
        let sessionid = getSessionParameter('sessionid');
        let role = getSessionParameter('userRole');
        
        this.validateSession(sessionid);
       
       
        this.idleLogout();
      
    }
    
    @wire(getSessionExpTime)
    search({data}) {
       
       if (data) {
        console.log('Session Expiry Time Result : '+JSON.stringify(data));
       
            this.sessExpTime = (data.ExpireTime__c) * 60000;
            console.log('this.sessExpTime : '+this.sessExpTime);
        }
        
       else {
        this.sessExpTime = 20 * 60000;
        }
   };
  

    

  
    validateSession(sessionid)
    {
        if (sessionid != null) {
            this.spinner=true;
          validateSession({
                  Sessionid: sessionid
              })
              .then(result => {
                  //  console.log('reslt' + result);
                      this.spinner=false;
                  //   alert('result' + result);
                  if (result == false) {
                      document.cookie = "userName =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      document.cookie = "userRole =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      document.cookie = "userId =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      document.cookie = "userDU =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      document.cookie = "userDUId =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      document.cookie = "sessionid =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      document.cookie = "managerEmail =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      document.cookie = "managerId =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      this.username = '';
                      this.login = true;
                      this.att = false;
                  } else {
                      this.login = false;
                      this.att = true;
                      // this.empid=getSessionParameter('userId');
                      // alert(this.empid);
                      this.employeetemplate = false;
                      this.pmstemplate = true;
                  }
              })
      }
    }
    
    //Inactive/Idle Session Logic -- Start

    

    idleLogout() {
        var t;
        window.onload = resetTimer.bind(this);
        window.onmousemove = resetTimer.bind(this);
        window.onmousedown = resetTimer.bind(this);  // catches touchscreen presses as well      
        window.ontouchstart = resetTimer.bind(this); // catches touchscreen swipes as well      
        window.ontouchmove = resetTimer.bind(this);  // required by some devices 
        window.onclick = resetTimer.bind(this);      // catches touchpad clicks as well
        window.onkeydown = resetTimer.bind(this);   
        window.addEventListener('scroll', resetTimer.bind(this), true); 

        function resetTimer() {
          
            clearTimeout(t);
            t = setTimeout(() =>{console.log('Logged out due to inactivity : ');
                                    this.logout();
                                   
                                    this.sessionTimeOut();
                                    },this.sessExpTime);  // time is in milliseconds
        }
       console.log('exptime   '+JSON.stringify(this.sessExpTime));
    }

    sessionTimeOut(){
        this.sessExp = true;
    }

    closeModal(){
        this.sessExp = false;
    }

   //Inactive/Idle Session Logic -- End

    handleEnter(event){
        if(event.keyCode === 13){
          this.submitotp();
        }
    }

    submitotp() {
        console.log(this.otp)
        if (this.otp == this.otpcheck) {
      
            this.username1 = this.username;
        //  console.log(this.username1);
        this.userrole1 = this.userRole;
        // console.log(this.userrole1);
        this.userid2 = this.userid1;
        //   console.log(this.userrole1);
        this.puid1 = this.puid;
        //  console.log(this.puid1);
        this.puName1 = this.puName;
        //   console.log(this.puName1);
        this.manageremail1 = this.Manageremail;
        // console.log(this.manageremail1);
        this.Managerid1 = this.Managerid;
        //  console.log(this.Managerid1);

        if (this.username1 != undefined && this.userrole1 != undefined && this.userid2 != undefined && this.puid1 != undefined && this.puName1 != undefined && this.manageremail1 != undefined && this.Managerid1 != undefined)
            //  console.log('login');
             {
            this.usernameCookies = escape(this.username1);
        //  console.log(this.usernameCookies);
        this.userroleCookies = (this.userrole1);
        // console.log('role' + this.userroleCookies);
        this.useridcookies = escape(this.userid2);
        //  console.log(this.useridcookies);
        // console.log(this.username);
        this.puidcookies = escape(this.puid1);
        //  console.log(this.puidcookies);
        // console.log(this.puidcookies);
        this.puNamecookies = (this.puName1);
        // console.log(this.puNamecookies);
        // console.log(this.puNamecookies);
        this.manageremail1cookies = escape(this.manageremail1);
        // console.log(this.manageremail1cookies);
        //console.log(this.manageremail1cookies);
        this.Managerid1cookies = escape(this.Managerid1);
        // console.log(this.Managerid1cookies);
        // console.log(this.Managerid1cookies);
    }
    //creating cookies
    document.cookie = "userName = " + this.usernameCookies + "; path=/";
    document.cookie = "userRole = " + this.userroleCookies + "; path=/";
    document.cookie = "userId = " + this.useridcookies + "; path=/";
    document.cookie = "userDU = " + this.puNamecookies + "; path=/";
    document.cookie = "userDUId = " + this.puidcookies + "; path=/";
    document.cookie = "managerEmail = " + this.manageremail1cookies + "; path=/";
    document.cookie = "managerId = " + this.Managerid1cookies + "; path=/";

    //creating session cookie
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz0123456789";
    var lenString = 15;
    var randomstring = '';
    var rnum;
    //loop to select a new character in each iteration  
    for (var i = 0; i < lenString; i++) {
        rnum = Math.floor(Math.random() * characters.length);
        randomstring += characters.substring(rnum, rnum + 1);
    }
    this.x = randomstring + new Date().valueOf();
    //this.x=this.useridcookies+this.usernameCookies+this.userroleCookies+this.puName+this.puid+this.manageremail1cookies+this.Managerid1cookies; 
    //this.y==JSON.parse(this.x)
    //create session cookie
    document.cookie = "sessionid = " + this.x + "; path=/";
    // console.log('sessionid' + this.x);
    // console.log('245' + this.manageremail1cookies);
     this.spinner=true;
    sessionmethod({
            sessionid: this.x,
            usenamecookie: this.usernameCookies,
            urolecookie: this.userroleCookies,
            uidcookie: this.useridcookies,
            punamecookie: this.puNamecookies,
            puidcookie: this.puidcookies,
            manageridcookie: this.Managerid1cookies,
            manageremailcookie: this.manageremail1cookies
        })
        .then(result => {
         this.spinner=false;
         console.log('reslt' + result);
        })
        .catch(error => {
              console.log('Errorured:- ' + error.body.message);
        });
    // alert('create cokkie' + document.cookie);
   
        this.dispatchEvent(new ShowToastEvent({
            title: 'Successfully logged into  ' + this.usernameCookies,
            variant: 'success',
            mode: 'pester'
        }), );
        this.att = true;
        //  this.empid=getSessionParameter('userId');
      
        this.pmstemplate = true;
        this.login = false;
        this.otppage = false;
        this.setCookie("userName", this.usernameCookies, 60);
        // console.log(251);
        var sessionid = getSessionParameter('sessionid');
        //   console.log(sessionid);

        // console.log('111111');
 
    } 
    else  {
        if (this.otp == undefined) {
            console.log('empty')
            this.errormsg = true;
            this.errormsg2 = false;
        }else{
        console.log('not equal')
        this.errormsg2 = true;
        this.errormsg=false;
        }

    }
   
    
}

  



logout() {
    this.otppage = false;
    this.att = false;
    this.login = true;
    this.username = null;
    this.otp = '';
    this.stageOTP=false;

    document.cookie = "userName =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userId =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userDU =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userDUId =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "sessionid =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "managerEmail =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "managerId =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    this.pmstemplate=false;
    
}

}