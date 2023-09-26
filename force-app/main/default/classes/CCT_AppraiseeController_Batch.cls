public class CCT_AppraiseeController_Batch implements Database.Batchable<sObject>,Database.Stateful  {
    /***
@author Sneha
@description Batch Apex start Method
@return null
@date 10/04/2023
**/
    
    public boolean isEligible =false;
    public boolean endDateAppraisee = false;
    public Date startDate;
    public Date endDate;
    public String cycleName;
    public String cycle;
    Map<Integer,String> month = new Map<Integer,String>{1=>'Jan',2=>'Feb',3=>'Mar',4=>'Apr',5=>'May',
        6=>'Jun',7=>'Jul',8=>'Aug',9=>'Sep',10=>'Oct',11=>'Nov',
        12=>'Dec'};
            public Database.QueryLocator start(Database.BatchableContext batch){
                List<String> cycles = new List<String>{CCT_Kriya_Constants.MIDTERMCYCLE,CCT_Kriya_Constants.ANNUALTERMCYCLE,CCT_Kriya_Constants.MIDTERMAPPRAISEE_TO_APPRAISER,CCT_Kriya_Constants.ANNUALTERMAPPRAISEE_TO_APPRAISER};
                    List<Appraisal_Cycles__mdt> cycleRecords = [SELECT Appraisal_Cycle_Name__c,End_Date__c,Stage__c,Start_Date__c,MasterLabel,Cycle__c
                                                                FROM Appraisal_Cycles__mdt WHERE MasterLabel IN : cycles WITH SECURITY_ENFORCED];
                system.debug(cycleRecords);
                for(Appraisal_Cycles__mdt record : cycleRecords ){ 
                    system.debug(record.Start_Date__c);
                    if( (record.MasterLabel == CCT_Kriya_Constants.MIDTERMCYCLE || record.MasterLabel == CCT_Kriya_Constants.ANNUALTERMCYCLE) && record.Start_Date__c == system.today()){
                        isEligible = true;
                        startDate = record.Start_Date__c; 
                        endDate = record.End_Date__c;
                        cycleName = month.get(startDate.month())+'\''+startDate.year()+'-'+month.get(endDate.month())+'\''+endDate.year();
                        cycle = record.Cycle__c;
                    } else if( (record.MasterLabel == CCT_Kriya_Constants.MIDTERMAPPRAISEE_TO_APPRAISER || record.MasterLabel == CCT_Kriya_Constants.ANNUALTERMAPPRAISEE_TO_APPRAISER) && record.End_Date__c == system.today()){
                        endDateAppraisee = true;
                    }    
                }
                Integer lastmonths = Integer.valueOf(Label.Minimum_Required_No_of_Months);
                String isEligiblequery = 'SELECT Id, Employee_Joining_Date__c, Name, AppraisalCycle__c, Designation__c, Band__c FROM Contact WHERE Designation__c !=NULL AND Band__c!=NULL AND Employee_Joining_Date__c !=NULL AND Appraiser__c!= NULL AND Experience_in_Cloudtaru__c >=: lastmonths WITH SECURITY_ENFORCED';
                system.debug(isEligiblequery);
               // if(isEligible || endDateAppraisee){
                    return Database.getQueryLocator(isEligiblequery);            
               // }
               // return null;    
            }
    /***
@author Sneha
@description Batch Apex execute Method
@List of contacts
@date 10/04/2023
**/
    public void execute(Database.BatchableContext batch, List<Contact> conLst){
        try {
            
            Map<Map<String, String>,List<string>> emailTemplateMap = new Map<Map<String, String>,List<string>>();
            List<Evaluation__c> recordsToInsert = new List<Evaluation__c>();
            List<Contact> recordsToUpdate = new List<Contact>();
            List<Evaluation__c> appraiseRecords = new List<Evaluation__c>();
            Id recordTypeId =Schema.SObjectType.Evaluation__c.getRecordTypeInfosByDeveloperName().get(CCT_Kriya_Constants.RECORDTYPE).getRecordTypeId();
            Set<String> contactIds = new Set<String>();
            for(Contact con : conLst){
                contactIds.add(con.Id);
            }
            if(endDateAppraisee){
                List<String> status = new List<String>{CCT_Kriya_Constants.INITIATED_STATUS, CCT_Kriya_Constants.NOTINITIATED_STATUS};
                    List<Evaluation__c> initiatedRecords = [SELECT Id,Status__c,EmployeeMaster__c ,AppraiserName__c,EmployeeMaster__r.Name,
                                                            EmployeeMaster__r.Email,IsAutoSubmit__c
                                                            FROM  Evaluation__c 
                                                            WHERE EmployeeMaster__c IN : contactIds 
                                                            AND Status__c IN : status
                                                            AND RecordTypeId =:recordTypeId];
                List<Evaluation__c> notInitiatedRecords = new List<Evaluation__c>();
                for(Evaluation__c  rec: initiatedRecords){
                    if(rec.Status__c == CCT_Kriya_Constants.NOTINITIATED_STATUS){
                        notInitiatedRecords.add(rec);
                    }
                    rec.Status__c = CCT_Kriya_Constants.AUTOSUBMITTED_STATUS;//CCT_Kriya_Constants.SUBMITTED_STATUS 
                    rec.IsAutoSubmit__c = true;
                    rec.SubmittedDate__c = system.today();
                }
                
                // Create task tracker records with Appraisee RecordType and weightages as 100%
                List<Task_Tracker__c> taskTrackerRecords = new List<Task_Tracker__c>();
                Id appraiseeRecordTypeId = Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
                
                for (Evaluation__c appraisal : notInitiatedRecords) {
                    Task_Tracker__c taskTracker = new Task_Tracker__c(
                        Evaluation__c = appraisal.Id,
                        RecordTypeId = appraiseeRecordTypeId,
                        Employee_Name__c = appraisal.EmployeeMaster__c,
                        MinWeightage__c = 100,
                        MaxWeightage__c = 100,
                        KPICategory__c = 'Functional',
                        KPI_Name__c = 'InTime Delivery',
                        Justification__c = 'This appraisal form is Auto Submitted',
                        Challenges__c =  'This appraisal form is Auto Submitted',
                        // SelfRating__c=0,
                        Weightage__c =100
                    );
                    taskTrackerRecords.add(taskTracker);
                }
                if(taskTrackerRecords != null && taskTrackerRecords.size()>0){
                    Database.insert(taskTrackerRecords, false); 
                }
                //update initiatedRecords;
                //     SObjectAccessDecision securityDecision = Security.stripInaccessible( AccessType.UPDATABLE, initiatedRecords);
                //     update securityDecision.getRecords();
                List<database.Saveresult> updateresults = new List<database.Saveresult>();
                if(initiatedRecords != null && initiatedRecords.size()>0){
                    updateresults=database.Update(initiatedRecords, false);
                }
                
                System.debug('initiatedRecords :: ' +initiatedRecords);
                if (updateResults[0].isSuccess()) 
                { 
                    //   List<String> emailList = new List<String>(); // Add email recipients
                    
                    
                    // Trigger email notification here Auto-Submitted to Appraiser
                    for(Evaluation__c  appraisal: initiatedRecords){
                        Map<String, String> fieldValuesMap = new Map<String, String>();  
                        List<String> emailRecList = new List<String>(); // Add email recipients
                        fieldValuesMap.put('KeySet', appraisal.Id+' KeySet');
                        fieldValuesMap.put('AppraiserName', appraisal.AppraiserName__c);
                        fieldValuesMap.put('AppraiseeName',appraisal.EmployeeMaster__r.Name);
                        fieldValuesMap.put('TriggerName','Auto_Submitted_to_Appraiser');
                        emailRecList.add(appraisal.EmployeeMaster__r.Email);
                        emailTemplateMap.put(fieldValuesMap,emailRecList);
                        //  listTemplateMap.add(emailTemplateMap);
                        system.debug('EmailTemplateMap'+emailTemplateMap);
                    }   
                    CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
                }     
            } else if(isEligible){ 
                //  system.debug('Arc'); 
                for(Contact con : conLst){
                    Contact contactRec = new Contact(Id=con.Id,AppraisalCycle__c=cycle);
                    Evaluation__c evaluation = new Evaluation__c(Name=con.Name+'   '+cycleName,recordTypeId = recordTypeId,Status__c = CCT_Kriya_Constants.NOTINITIATED_STATUS ,
                                                                 EmployeeMaster__c=con.Id, Start_Date__c = startDate,End_Date__c= endDate,AppraisalCycle__c=cycle);
                    recordsToInsert.add(evaluation);
                    recordsToUpdate.add(contactRec);
                    system.debug(contactRec);
                    system.debug(evaluation);
                    //appraiseRecords.add(evaluation); 
                }
                // system.debug(recordsToUpsert);
                if((recordsToInsert!=null && !recordsToInsert.isEmpty()) && (recordsToUpdate!=null && !recordsToUpdate.isEmpty())){
                    //    SObjectAccessDecision securityDecision = Security.stripInaccessible( AccessType.UPSERTABLE,recordsToUpsert);
                    //  upsert securityDecision.getRecords();
                    // system.debug('104'+recordsToUpsert);
                    List<Database.SaveResult> insertResults = Database.insert(recordsToInsert, false);
                    List<Database.SaveResult> updateResults = Database.update(recordsToUpdate, false);
                    
                    List<Evaluation__c> newlyCreatedRecords=[Select Id,EmployeeMaster__r.Email, EmployeeMaster__r.Appraiser__r.Email,EmployeeMaster__r.Reviewer__r.Email,Start_Date__c,End_Date__c from Evaluation__c where Status__c = :CCT_Kriya_Constants.NOTINITIATED_STATUS and Start_Date__c = :startDate and End_Date__c= :endDate and AppraisalCycle__c=:cycle ];
                    System.debug('106:Size'+updateResults.size());
                    System.debug('107:Size'+updateResults);
                    if (insertResults[0].isSuccess()) {
                        // system.debug('109'+recordsToUpsert);
                        System.debug('newlyCreatedRecords size :: ' +newlyCreatedRecords.size());
                        // Trigger email notification here for each Evaluation__c record  Appraisal Not Initiated
                        for (Evaluation__c appraisal : newlyCreatedRecords) {
                            System.debug('114:Appraisal Names:'+appraisal);
                            List<String> emailList = new List<String>(); 
                            Map<String, String> fieldValuesMap = new Map<String, String>();
                            fieldValuesMap.put('KeySet', appraisal.Id);
                            fieldValuesMap.put('StartDate', String.valueOf(appraisal.Start_Date__c));
                            fieldValuesMap.put('EndDate', String.valueOf(appraisal.End_Date__c));
                            fieldValuesMap.put('TriggerName','Notification_to_Appraisee');
                            
                            emailList.add(appraisal.EmployeeMaster__r.Email);
                            /* if(appraisal.EmployeeMaster__r.Appraiser__c!=null){
emailList.add(appraisal.EmployeeMaster__r.Appraiser__r.Email);
}
if(appraisal.EmployeeMaster__r.Reviewer__c!=null){
emailList.add(appraisal.EmployeeMaster__r.Reviewer__r.Email);
}*/
                            emailTemplateMap.put(fieldValuesMap,emailList);
                            System.debug('122: Email List:'+emailList);
                            // CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
                            // CCT_PMS_EmailTemplateFramework.sendCustomNotification('Notification to Appraisee', emailList, fieldValuesMap);
                        }
                        CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
                    }
                    
                }
            }
            
            system.debug('sa'+emailTemplateMap);
        } catch(Exception e) {
            // system.debug(e.getMessage());
        }
    }
    /***
@author Sneha
@description Batch Apex finish Method
@date 10/04/2023
**/
    public void finish(Database.BatchableContext batch){ 
        
    }
    
}