public without sharing class appframeowrkcls {
    @AuraEnabled
    public static list<string> checkUsername(string username){
        list<string> userdetails = new list<string>();
        system.debug(username);
        try{
            list<Contact> empdetails =[select id,Email,LastName,password__c,role__c,PU_DU__r.Name,PU_DU__c,Active__c,ReportsTo.email,ReportsToid from Contact where Email=:username AND Active__c = TRUE];
            system.debug('empdetails' +empdetails);    
            if(empdetails.size()>0){
                userdetails.add(empdetails[0].LastName);
                userdetails.add(empdetails[0].role__c);
                
               
                userdetails.add(empdetails[0].id);
                userdetails.add(empdetails[0].PU_DU__c);
              
                string sa = empdetails[0].PU_DU__r.Name;
                string re=empdetails[0].ReportsTo.Email;
               
                userdetails.add(sa);
                userdetails.add(empdetails[0].ReportsToid);
                userdetails.add(re);
            }
            else{
                userdetails=new list<string>();  
            }
        }
        catch(exception e){
            throw new AuraHandledException(e.getMessage());
        }
        return userdetails;
    }

    @AuraEnabled
    public static  void  sessionmethod(string sessionid,string usenamecookie,string urolecookie,string uidcookie,string punamecookie,string puidcookie,string manageridcookie,string manageremailcookie){
        system.debug('sessionid' +sessionid);
        empdetailswraper emp=new empdetailswraper(usenamecookie,urolecookie,uidcookie,punamecookie,puidcookie,manageridcookie,manageremailcookie);
        string svalue=JSON.serialize(emp);
        system.debug('jsonformat' +svalue);
      //  custom_settings__mdt	custom=[select Absolute_Time__c,ExpireTime__c from custom_settings__mdt limit 1];  
        Task_Tracker_Settings__mdt	Tasktrackercustom=[select Absolute_Time__c,ExpireTime__c from Task_Tracker_Settings__mdt limit 1];  
        integer AbsoluteTime=integer.valueOf(Tasktrackercustom.Absolute_Time__c);
        integer ExpireTime=integer.valueOf(Tasktrackercustom.ExpireTime__c);      
        list<datetime> d1=new list<datetime>();  
        Datetime now = Datetime.now();
        Integer offset = UserInfo.getTimezone().getOffset(now);
        Datetime logintime = now.addSeconds(offset/1000);     
        Long gettime = logintime.getTime();
        System.debug('ss' +gettime);      
        datetime exptime=logintime.addMinutes(ExpireTime);
        Long exptimemseconds = exptime.getTime();   
        datetime FinalExptime=logintime.addMinutes(AbsoluteTime);
        Long finaltimemilliseconds = FinalExptime.getTime();
        d1.add(logintime);
        d1.add(exptime);
        system.debug('time' +d1);
        system.debug('logintme' +logintime);
        system.debug('exptime' +exptime);
        sessioninsert(Sessionid,logintime,exptime,gettime,exptimemseconds, FinalExptime, finaltimemilliseconds,svalue);
    }

    @AuraEnabled
    public static sessionObj__c sessioninsert(string Sessionid,datetime logintime,datetime exptime,long gettime,long exptimemseconds,datetime FinalExptime,long finaltimemilliseconds,string svalue)
    {
        System.debug('84' +svalue);
        sessionObj__c s=new sessionObj__c();
        s.Sessionid__c=sessionid;
        s.loginDate__c=logintime;
        s.SessionExpdate__c=exptime;
        s.logintimemilliseconds__c=gettime;
        s.ExpireTimemilliseconds__c=exptimemseconds;
        s.FinalExptime__c=FinalExptime;
        s.finalexpmilliseconds__c=finaltimemilliseconds;
        s.sessionvalue__c=svalue;
        insert s;
        system.debug('sessionobjrecord' +s);
        return s;
    }

   @AuraEnabled(cacheable=true)
    public static Task_Tracker_Settings__mdt getSessionExpTime(){
        Task_Tracker_Settings__mdt	Tasktrackercustom = [select Absolute_Time__c,ExpireTime__c from Task_Tracker_Settings__mdt limit 1];  
		 system.debug('Tasktracker' +Tasktrackercustom);
        return Tasktrackercustom;
        
    }

    @AuraEnabled
    public static boolean validateSession(string Sessionid)
    {
        system.debug(Sessionid);
        boolean quicktime;
        sessionObj__c sess=[select Name,Sessionid__c,sessionvalue__c,sessionExpDate__c, ExpireTimemilliseconds__c,logintimemilliseconds__c,finalexpmilliseconds__c from sessionObj__c where Sessionid__c=:Sessionid  order by createddate DESC limit 1]; 
       // custom_settings__mdt	custom=[select Absolute_Time__c,ExpireTime__c from custom_settings__mdt limit 1];
        Task_Tracker_Settings__mdt	Tasktrackercustom=[select Absolute_Time__c,ExpireTime__c from Task_Tracker_Settings__mdt limit 1];  
        integer ExpireTime=integer.valueOf(Tasktrackercustom.ExpireTime__c);
        if(system.now().getTime()<sess.ExpireTimemilliseconds__c){
            if(system.now().gettime()<=sess.finalexpmilliseconds__c){
                system.debug('devika');
                quicktime=true;
                sess.sessionExpDate__c=Datetime.now().addMinutes(ExpireTime);
                sess.ExpireTimemilliseconds__c = Datetime.now().addMinutes(ExpireTime).getTime();
                update sess;
            }
        }
        else{
            system.debug('deep');
            quicktime=false;
        }
        system.debug('quicktime' +quicktime);
        return quicktime;
    }
    
    @AuraEnabled
    public static integer sendotp( string username){
        
        integer numberToGen;
        numberToGen = Math.round((Math.random() * (9000) + 1000));
        List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
        
        Messaging.SingleEmailMessage mail =  new Messaging.SingleEmailMessage();
        
        List<String> sendTo = new List<String>();
         List<OrgWideEmailAddress> owa  = new List<OrgWideEmailAddress>();
        owa = [SELECT Address, DisplayName, Id FROM OrgWideEmailAddress where DisplayName= 'HELP DESK' LIMIT 1];
        if(!owa.isEmpty())
        {
            mail.setOrgWideEmailAddressId(owa[0].Id);   // From email : Orgwide Default Email Address
        }
        
        sendTo.add(username);
        mail.setToAddresses(sendTo);
        mail.setSubject('OTP through email');    
        //mail.setSenderDisplayName('CloudTaru');                    
        String body = 'Dear:---  User,'  + '\n'+ 
            'UserName:--'+ username +'\n'+ '\n'+'\n'+
            'OTP : '+ numberToGen +'\n';
        
        mail.setPlainTextBody(body);
        mails.add(mail);
          Messaging.sendEmail(mails);
        return numberToGen;
    }
    
    public without sharing class empdetailswraper{
        //    public  string sessionid;
        public  string usename;
        public  string userole;
        public  string userid;
        public  string managerid;
        public  string manageremail;
        public  string puname;
        public  string puid;
        
        public empdetailswraper(string uname,string urole,string uid,string memail,string mid,string pname,string pid){
            //    this.sessionid=sid;
            this.usename =uname;
            this.userole =urole;
            this.userid =uid;
            this.managerid =mid;
            this.manageremail =memail;
            this.puname=pname;
            this.puid=pid;
            
        }       
    }
}