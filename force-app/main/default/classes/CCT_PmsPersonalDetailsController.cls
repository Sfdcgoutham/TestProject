/**
* @description 
*/
public without sharing class CCT_PmsPersonalDetailsController {
    /**
* @description 
* @param emailvalue
* @return contact
*/
    @AuraEnabled
    public static contact getEmployeeinformaation(string emailvalue){
        contact con = new Contact();
        try {//Bank_Name__c, Account_Number__c, IFSC_Code__c,Bank_Account_Type__c,BankBranch__c,NameOnBank__c,
            con = [select id,email,Birthdate, MobilePhone, Marital_Status__c,PAN_Number__c, Tax_Regime__c, Father_Name__c,
                   MailingStreet, MailingCity, MailingState,  MailingCountry,ReportsTo.Name,Employee_Id__c,
                   MailingPostalCode, OtherStreet, OtherCity, OtherState, OtherCountry, OtherPostalCode,
                   Name,Aadhar_Number__c,Nationality__c,BloodGroup__c,SubBand__c,
                   Employee_Joining_Date__c,Role__c,Reviewer__c,Reviewer__r.Name, Appraiser__c,Appraiser__r.Name,DelegatedAppraiser__c,
                   DelegatedAppraiser__r.Name,DelegatedReviewer__c,DelegatedReviewer__r.Name,
                   Experience_in_Cloudtaru__c,Band__c ,Designation__c
                   from Contact  where Email =:emailvalue WITH SECURITY_ENFORCED limit 1];
            return con;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    /**
* @description Method to getReviewerRecords.
* @param employeeId string
* @return List<Evaluation__c>
*/
    @AuraEnabled
    public static List<Evaluation__c> getApraiseeRecords(string employeeId){
        List<Evaluation__c> evaluationData = [SELECT 
                                              Id, Name, AppraiserFeedback__c,AppraiserRating__c,ConflictFlag__c,EligibilityForPromotion__c,EmployeeMaster__c, EmployeeMaster__r.Name,
                                              JustificationForEligibility__c, OverallComments__c, OverallRating__c, PRDDateAndTime__c, PRDWithAppraiserIsDone__c,
                                              ReviewerFeedback__c, ReviewerRating__c, Status__c, SubmittedDate__c, WhatCanBeDoneBetter__c, WhatHappenedWell__c ,ReviewerName__c,AppraiserName__c,Start_Date__c,End_Date__c
                                              FROM Evaluation__c where EmployeeMaster__c = :employeeId and Start_Date__c <=TODAY AND Start_Date__c > LAST_N_YEARS:3 WITH SECURITY_ENFORCED  Order by CreatedDate DESC limit 7 ];
        //Status__c IN ('Not Initiated','Final Rating Available','Initiated') and 
        return evaluationData;
    }
    /**
* @description Method to getReviewerRecords.
* @param recordId string
* @return List<Evaluation__c>
*/
    @AuraEnabled
    public static List<Evaluation__c> checkStatus(string recordId){
        List<Evaluation__c> evaluationData = [SELECT 
                                              Id, Name, AppraiserFeedback__c,AppraiserRating__c,GrievenceComment__c,ApraiseeOverallRating__c,AppraiserComments__c,ConflictFlag__c,ClosureComments__c,EligibilityForPromotion__c,EmployeeMaster__c, EmployeeMaster__r.Name,EmployeeMaster__r.Designation__c,
                                              JustificationForEligibility__c, OverallComments__c, OverallRating__c, PRDDateAndTime__c, PRDWithAppraiserIsDone__c,PRDDuration__c,
                                              ReviewerFeedback__c, ReviewerRating__c, Status__c, AppraisalCycle__c,SubmittedDate__c,WhatCanBeDoneBetter__c, WhatHappenedWell__c,ReviewerName__c,AppraiserName__c,Start_Date__c,End_Date__c
                                              FROM Evaluation__c where Id=:recordId WITH SECURITY_ENFORCED];
        
        return evaluationData;
    }
    /**
* @description Method to getReviewerRecords.
* @param des string
* @return List<Task_Tracker__c>
*/
  /*  @AuraEnabled
    public static List<Task_Tracker__c> checkKpidata1( string des){
        Id recordTypeId =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('KPI').getRecordTypeId();
        
        List<Task_Tracker__c> evaluationData = [SELECT 
                                                Id, Name,Active__c,Average_Allocation_for_the_time_perdiod__c,Band__c,Challenges__c,Designation__c,Evaluation__c,
                                                Justification__c,MaxWeightage__c,KPICategory__c,KPI_Name__c,Mandatory__c,Measurement_Criteria_Description__c,MinWeightage__c,
                                                Rating__c,Task_Description__c,Weightage__c,Objectives_And_Key_Results__c
                                                FROM Task_Tracker__c where KPICategory__c!= null and recordTypeId=:recordTypeId and Band__c ='Band C'  and Designation__c =:des and Active__c =true WITH SECURITY_ENFORCED
                                                ORDER By KPICategory__c];
        
        return evaluationData;
    }*/
    /**
* @description Method to getReviewerRecords.
* @param des string
* @param band string
* @return map<String,list<Task_Tracker__c>>
*/
    @AuraEnabled
    public static map<String,list<Task_Tracker__c>> displayKpi(string des,string band){
        //system.debug(des);
        //system.debug(band);
        
        map<string,list<Task_Tracker__c>> mapTaskList  = new map<string,list<Task_Tracker__c>> ();
        Id recordTypeIdKpi =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('KPI').getRecordTypeId();
        
        
        //list<Task_Tracker__c> taskList=new List<Task_Tracker__c>();
        List<Task_Tracker__c> evaluationData = [SELECT 
                                                Id, Name,Active__c,Average_Allocation_for_the_time_perdiod__c,Band__c,Challenges__c,Designation__c,Evaluation__c,
                                                Justification__c,MaxWeightage__c,KPICategory__c,KPI_Name__c,Mandatory__c,Measurement_Criteria_Description__c,MinWeightage__c,
                                                Rating__c,SelfRating__c,Task_Description__c,Weightage__c,Objectives_And_Key_Results__c
                                                FROM Task_Tracker__c where KPICategory__c!= null and recordTypeId=:recordTypeIdKpi and Band__c =:band  and Designation__c =:des and Active__c =true and MasterKPIId__c='' WITH SECURITY_ENFORCED
                                                ORDER By KPICategory__c];
        //Get the recordtype Id
        // Id recordTypeId = Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        /* List<PMS_KPI_Fields__mdt> kpiFieldList = [Select Id, Label, FieldLabel__c, Sequence__c, FieldAPI__c, Editable__c, ObjectAPI__c, UserRole__c, Status__c,  Mandatory__c, Checkbox__c, Picklist__c, Text__c, Date__c, TextArea__c
from PMS_KPI_Fields__mdt where UserRole__c=:userRole and Status__c=:status order by Sequence__c];

List<string> fieldsToFetch = new List<string>();
for(PMS_KPI_Fields__mdt kfl : kpiFieldList) 
{
string fieldName = kfl.FieldAPI__c;
fieldsToFetch.add(fieldName);
}

string fieldList = '';
for(string str : fieldsToFetch)
{
fieldList += str+',';
}
// remove last additional comma from string
fieldList = fieldList.removeEnd(',');

list<Task_Tracker__c> evaluationData;
string condition = 'Where KPICategory__c!= null and Evaluation__c=:evlId and recordtypeId=:recordTypeIdKpi and Band__c =:band and Designation__c =:des and Active__c =true and MasterKPIId__c=null ORDER By KPICategory__c';
string sobj = 'Task_Tracker__c';
string soqlQuery = 'Select KPICategory__c, Band__c, Designation__c, Active__c, MasterKPIId__c, ' +fieldList+ ' from ' +sobj+ ' ' +condition;
evaluationData = Database.query(soqlQuery);*/
        
        for ( Task_Tracker__c tasks : evaluationData){
            if(mapTaskList.containskey(tasks.KPICategory__c)){
                list<Task_Tracker__c> taskList=mapTaskList.get(tasks.KPICategory__c);
                taskList.add(tasks);
                mapTaskList.put(tasks.KPICategory__c,taskList);
            }else{
                mapTaskList.put(tasks.KPICategory__c, new List<Task_Tracker__c>{tasks});
            }
        }
        return mapTaskList;
    }
    
    /**
* @description Method to getReviewerRecords.
* @param employeeId string
* @param recordId string
* @return Evaluation__c
*/
    @AuraEnabled
    public static Evaluation__c updateApraisalRecord(string employeeId, string recordId){
        
        // System.debug('Employee Id :- '+employeeId);
        //KPIs that are been added to the Mid-Term Appraisal form by an Appraisee, should be added automatically in Annual Appraisal form when is gets initiated.
        List<Evaluation__c> evaluRecord = [Select Id, Name,AppraiserName__c,EmployeeMaster__r.Email,End_Date__c,EmployeeMaster__r.Name, AppraisalCycle__c from Evaluation__c where Id = :recordId and AppraisalCycle__c ='Annual Cycle' WITH SECURITY_ENFORCED];
        If(evaluRecord.size() > 0){
            
            Id recordTypeId =Schema.SObjectType.Evaluation__c.getRecordTypeInfosByDeveloperName().get('Appraisal_Form').getRecordTypeId();
            List<Evaluation__c> evalRecords = [select id ,AppraisalCycle__c, CreatedDate, EmployeeMaster__c, (select id, name, MasterKPIId__c, Mandatory__c, Evaluation__c, KPI_Name__c, KPICategory__c, Measurement_Criteria_Description__c, Objectives_And_Key_Results__c, RecordTypeId from Task_Tracker__r ) from Evaluation__c where AppraisalCycle__c ='Mid Term Cycle' and RecordTypeId = :recordTypeId and EmployeeMaster__c = :employeeId WITH SECURITY_ENFORCED order by CreatedDate desc];
            
            
            List<Task_Tracker__c> taskList = new List<Task_Tracker__c>();
            for(Evaluation__c evalRecord : evalRecords) {
                
                List<Task_Tracker__c> taskTrackerRecords = evalRecord.Task_Tracker__r;
                if(taskTrackerRecords.size() > 0) {
                    for (Task_Tracker__c taskTrackerRecord : taskTrackerRecords) {
                        Task_Tracker__c record = new Task_Tracker__c();
                        record.recordTypeId=taskTrackerRecord.RecordTypeId;
                        record.Evaluation__c=recordId;
                        record.Mandatory__c = taskTrackerRecord.Mandatory__c;
                        record.MasterKPIId__c=taskTrackerRecord.MasterKPIId__c;
                        record.KPI_Name__c=taskTrackerRecord.KPI_Name__c;
                        record.KPICategory__c=taskTrackerRecord.KPICategory__c;
                        record.Measurement_Criteria_Description__c=taskTrackerRecord.Measurement_Criteria_Description__c;
                        record.Objectives_And_Key_Results__c=taskTrackerRecord.Objectives_And_Key_Results__c;
                        taskList.add(record);
                    }
                }
            }
            if(taskList.size() > 0) {
                // System.debug('Tasks Inserted');
                //  System.debug(taskList);
                insert taskList;
            }
            //System.debug(taskList);
        }
        List<Evaluation__c> updatevaluRecord = [Select Id, Name,AppraiserName__c,EmployeeMaster__r.Email,End_Date__c,EmployeeMaster__r.Name, AppraisalCycle__c from Evaluation__c where Id = :recordId  WITH SECURITY_ENFORCED];
        
        //Evaluation__c e = new Evaluation__c();
        // updatevaluRecord[0].id=recordId;
        updatevaluRecord[0].Status__c='Initiated';
        // update e;
        List<string> listEmail = new List<string>();
        List<database.Saveresult> updateresults =database.Update( updatevaluRecord, false);
        
        if (updateResults[0].isSuccess()) 
        {
            Map<Map<String, String>,List<string>> emailTemplateMap = new Map<Map<String, String>,List<string>>(); 
            map<string,string> mergeFieldsData = new map<string,string>();
            mergeFieldsData.put('KeySet', updatevaluRecord[0].Id);
            mergeFieldsData.put('AppraiserName', updatevaluRecord[0].AppraiserName__c);
            mergeFieldsData.put('AppraiseeName', updatevaluRecord[0].EmployeeMaster__r.Name);
            mergeFieldsData.put('endDate', string.valueOf(updatevaluRecord[0].End_Date__c));
            mergeFieldsData.put('CycleName', string.valueOf(updatevaluRecord[0].AppraisalCycle__c));
            mergeFieldsData.put('TriggerName','Initated_Appraisal_Cycle');
            //mergeFieldsData.put('EndDate', string.valueOf(evaluationRecord.End_Date__c));
            listEmail.add(updatevaluRecord[0].EmployeeMaster__r.Email);
            emailTemplateMap.put(mergeFieldsData,listEmail);
            system.debug('EmailTemplateMap'+emailTemplateMap);
            CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
            
        } 
        else 
        { 
            System.debug('Record failed to update. Error message: ' + updateResults[0].getErrors()[0].getMessage());
        }
        
        return updatevaluRecord[0];
    }
    /**
* @description Method to getReviewerRecords.
* @param employeeId string
* @param recordId string
* @param kpiList List
* @return Task_Tracker__c
*/
    @AuraEnabled
    public static List<Task_Tracker__c> insertApraiseeTasks(string employeeId, string recordId, List<Task_Tracker__c> kpiList){
        
        Id recordTypeId =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        // Id recordTypeIdKpi =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('KPI').getRecordTypeId();
        
        for(Task_Tracker__c record : kpiList ){
            
            record.recordTypeId=recordTypeId;
            record.Evaluation__c=recordId;
            record.Employee_Name__c=employeeId;
            record.MasterKPIId__c=String.valueOf(record.Id);
            record.Id=null;
        }
        insert kpiList;
        return kpiList;
        
    }
    /**

* @return taskList

* @param evlId

* @description to get details of tasktracker .

*/
    @AuraEnabled
    public static List<Task_Tracker__c> compareList(string evlId){
        Id recordTypeId =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        
        List<Task_Tracker__c> taskList=[select Id ,MasterKPIId__c,KPICategory__c from Task_Tracker__c where Evaluation__c=:evlId and recordTypeId=:recordTypeId and MasterKPIId__c!=null with SECURITY_ENFORCED] ;
        return taskList;
    }
    /**


* @return Task_Tracker__c
* @param taskRec

* @description to get details of tasktracker .

*/
    @AuraEnabled
    public static sObject saveKpi(sObject taskRec){
        // Map<String,Object> qt = (Map<String,Object>)JSON.deserializeUntyped(taskRec);
        // system.debug(qt);
        // Task_Tracker__c t = new Task_Tracker__c();
        // if(qt.get('justification')!=null){
        //     t.Justification__c = String.valueOf(qt.get('justification'));
        // }
        // if(qt.get('challenges')!=null){
        //     t.Challenges__c = String.valueOf(qt.get('challenges'));
        // }
        // if(qt.get('selfRating')!=null){
        //     t.SelfRating__c = String.valueOf(qt.get('selfRating'));
        // }
        // if(qt.get('weightageValue')!=null){
        //     t.Weightage__c = Integer.valueOf(qt.get('weightageValue'));
        // }
        // if(qt.get('Id')!=null){
        //     t.Id=String.valueOf(qt.get('Id'));
        // }
        update taskRec;
        return taskRec;
    }
    
    /* public class TaskTrackerWrapper{
@AuraEnabled
public string Id;
@AuraEnabled
public string Justification;
@AuraEnabled
public string Challenges;
@AuraEnabled
public string SelfRating;
@AuraEnabled
public integer Weightage;
}*/
    /**

* @return taskList

* @param evlId

* @description to get details of tasktracker .

*/
    @AuraEnabled
    public static List<Task_Tracker__c> getTaskList(string evlId){
        Id recordTypeId =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        List<Task_Tracker__c> evaluationData = [SELECT  Id, Name,Active__c,Average_Allocation_for_the_time_perdiod__c,Band__c,Challenges__c,Designation__c,Evaluation__c,
                                                Justification__c,MaxWeightage__c,KPICategory__c,KPI_Name__c,Mandatory__c,Measurement_Criteria_Description__c,MinWeightage__c,
                                                Rating__c,SelfRating__c,Task_Description__c,Weightage__c,Objectives_And_Key_Results__c
                                                FROM Task_Tracker__c where Evaluation__c =:evlId and recordTypeId=:recordTypeId  WITH SECURITY_ENFORCED];
        return evaluationData;
    }
    /**


* @param kpiId

* @description to get details of tasktracker .

*/
    @AuraEnabled
    public static void getDeleteRec(string kpiId){
        
        Task_Tracker__c t =[SELECT  Id, Name,Active__c,Average_Allocation_for_the_time_perdiod__c,Band__c,Challenges__c,Designation__c,Evaluation__c,
                            Justification__c,MaxWeightage__c,KPICategory__c,KPI_Name__c,Mandatory__c,Measurement_Criteria_Description__c,MinWeightage__c,
                            Rating__c,SelfRating__c,Task_Description__c,Weightage__c,Objectives_And_Key_Results__c
                            FROM Task_Tracker__c where Id=:kpiId WITH SECURITY_ENFORCED];
        
        
        if(t.Mandatory__c==true) {
            // Throw an exception to prevent the record from being deleted
            throw new AuraHandledException('Cannot delete mandatory record.');
        } else {
            delete t;
        }
        
        
    }
    /**

* @return taskList

* @param evlId

* @description to get details of tasktracker .

*/
    @AuraEnabled
    public static Double calSumOfTask(string evlId){
        Id recordTypeId =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        List<Task_Tracker__c> evaluationData = [SELECT  Id, Name,Active__c,Average_Allocation_for_the_time_perdiod__c,Band__c,Challenges__c,Designation__c,Evaluation__c,
                                                Justification__c,MaxWeightage__c,KPICategory__c,KPI_Name__c,Mandatory__c,Measurement_Criteria_Description__c,MinWeightage__c,
                                                Rating__c,SelfRating__c,Task_Description__c,Weightage__c,Objectives_And_Key_Results__c
                                                FROM Task_Tracker__c where Evaluation__c =:evlId and recordTypeId=:recordTypeId  WITH SECURITY_ENFORCED];
        Double totalWeightage = 0;
        for( Task_Tracker__c tsum : evaluationData){
            if(tsum.Weightage__c!=null){
                totalWeightage += tsum.Weightage__c;
            }
        }
        //  system.debug(totalWeightage);
        // if(totalWeightage==100){
        // throw new AuraHandledException('weightage should be 100.');
        // }
        
        return totalWeightage;
    }
    /**
* @description Method to getReviewerRecords.
* @param evlId string
* @param userRole string
* @param status string
* @return map<String,list<Task_Tracker__c>>
*/
    @AuraEnabled
    public static map<String,list<Task_Tracker__c>> getKpiList(string evlId, string userRole, string status){
        
        // system.debug(evlId);
        // system.debug(userRole);
        // system.debug(status);
        map<string,list<Task_Tracker__c>> mapTaskList  = new map<string,list<Task_Tracker__c>> ();
        
        //Get the recordtype Id
        Id recordTypeId = Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        List<PMS_KPI_Fields__mdt> kpiFieldList = [Select Id, Label, FieldLabel__c, Sequence__c, FieldAPI__c, Editable__c, ObjectAPI__c, UserRole__c, Status__c,  Mandatory__c, Checkbox__c, Picklist__c, Text__c, Date__c, TextArea__c
                                                  from PMS_KPI_Fields__mdt where UserRole__c=:userRole and Status__c=:status order by Sequence__c];
        
        List<string> fieldsToFetch = new List<string>();
        for(PMS_KPI_Fields__mdt kfl : kpiFieldList) 
        {
            string fieldName = kfl.FieldAPI__c;
            fieldsToFetch.add(fieldName);
        }
        
        string fieldList = '';
        for(string str : fieldsToFetch)
        {
            fieldList += str+',';
        }
        // remove last additional comma from string
        fieldList = fieldList.removeEnd(',');
        
        list<Task_Tracker__c> evaluationData;
        string condition = 'Where KPICategory__c!= null and Evaluation__c=:evlId and recordtypeId=:recordTypeId ORDER By KPICategory__c';
        string sobj = 'Task_Tracker__c';
        string soqlQuery = 'Select KPICategory__c, ' +fieldList+ ' from ' +sobj+ ' ' +condition;
        evaluationData = Database.query(soqlQuery);
        
        for ( Task_Tracker__c tasks : evaluationData){
            if(mapTaskList.containskey(tasks.KPICategory__c)){
                list<Task_Tracker__c> taskList=mapTaskList.get(tasks.KPICategory__c);
                taskList.add(tasks);
                mapTaskList.put(tasks.KPICategory__c,taskList);
            }else{
                mapTaskList.put(tasks.KPICategory__c, new List<Task_Tracker__c>{tasks});
            }
        }
        // system.debug(mapTaskList);
        return mapTaskList;
    }
    /**
* @description Method to getReviewerRecords.


* @param evlId string
* @param band string
* @param des string
* @return List<Task_Tracker__c>
*/
    @AuraEnabled
    public static List<Task_Tracker__c> getEvaluationDataForCompare(String  evlId, String band, String des) {
        Id recordTypeIdKpi =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('KPI').getRecordTypeId();
        return [SELECT 
                Id, Name, Active__c, Average_Allocation_for_the_time_perdiod__c, Band__c, Challenges__c, Designation__c,
                Evaluation__c, Justification__c, MaxWeightage__c, KPICategory__c, KPI_Name__c, Mandatory__c,
                Measurement_Criteria_Description__c, MinWeightage__c, Rating__c, SelfRating__c, Task_Description__c,
                Weightage__c, Objectives_And_Key_Results__c
                FROM Task_Tracker__c 
                WHERE KPICategory__c!= null AND RecordTypeId=:recordTypeIdKpi AND Band__c =:band AND Designation__c =:des AND Active__c =true and Mandatory__c=true
                WITH SECURITY_ENFORCED
                ORDER By KPICategory__c];
    }
    /**
* @description Method to getReviewerRecords.


* @param evlId string
* @param band string
* @param des string
* @return List<Task_Tracker__c>
*/
    @AuraEnabled
    public static List<Task_Tracker__c> getTaskListForCompare(Id evlId, String band, String des) {
        Id recordTypeIdTask =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        return [SELECT 
                Id, MasterKPIId__c, KPICategory__c
                FROM Task_Tracker__c 
                WHERE Evaluation__c=:evlId AND RecordTypeId=:recordTypeIdTask AND Band__c =:band AND Designation__c =:des AND Active__c =true 
                WITH SECURITY_ENFORCED];
    }
    /**
* @description Method to checkMandatoryKpis.
* @param evlId string
* @param band string
* @param des string
* @return List<String>
*/
    @AuraEnabled
    public static List<String> checkMandatoryKpis(String evlId, String band, String des) {
        Id recordTypeIdTask = Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        Id recordTypeIdKpi = Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('KPI').getRecordTypeId();
        
        List<Task_Tracker__c> taskList = [SELECT Id, MasterKPIId__c, KPICategory__c FROM Task_Tracker__c WHERE Evaluation__c = :evlId AND RecordTypeId = :recordTypeIdTask AND Band__c = :band AND Designation__c = :des AND Active__c = true WITH SECURITY_ENFORCED];
        
        List<Task_Tracker__c> evaluationData = [SELECT Id, KPI_Name__c, Mandatory__c FROM Task_Tracker__c WHERE KPICategory__c != null AND RecordTypeId = :recordTypeIdKpi AND Band__c = :band AND Designation__c = :des AND Active__c = true and Mandatory__c=true WITH SECURITY_ENFORCED ORDER BY KPICategory__c];
        // system.debug(taskList);
        // system.debug(evaluationData);
        List<String> mandatoryKpisNotFound = new List<String>();
        
        for(Task_Tracker__c evaluation : evaluationData) {
            if(evaluation.Mandatory__c) {
                Boolean mandatoryKpiFound = false;
                for(Task_Tracker__c task : taskList) {
                    if(task.MasterKPIId__c == evaluation.Id) {
                        mandatoryKpiFound = true;
                        break;
                    }
                }
                if(!mandatoryKpiFound) {
                    mandatoryKpisNotFound.add(evaluation.KPI_Name__c);
                }
            }
        }
        // system.debug(mandatoryKpisNotFound);
        return mandatoryKpisNotFound;
    }
    /**
* @description Method to updateEvalRecord.
* @param evlId string
* @return Evaluation__c
*/
    @AuraEnabled
    public static Evaluation__c updateEvalRecord(String evlId){
        Evaluation__c appraisal = [SELECT Id, Status__c, AppraiserName__c,End_Date__c,EmployeeMaster__r.Email,EmployeeMaster__r.Name,EmployeeMaster__r.Appraiser__r.Email FROM Evaluation__c WHERE Id =:evlId with SECURITY_ENFORCED];
        
        // Evaluation__c e = new Evaluation__c();
        // e.Id=evlId;
        appraisal.Status__c='Submitted';
        appraisal.SubmittedDate__c=date.TODAY();
        
        List<string> listEmail = new List<string>();
         List<string> listEmail2 = new List<string>();
        List<database.Saveresult> updateresults =database.Update( new list<evaluation__c>{appraisal}, false);
        if (updateResults[0].isSuccess()) 
        {
            Map<Map<String, String>,List<string>> emailTemplateMap = new Map<Map<String, String>,List<string>>(); 
            map<string,string> mergeFieldsData = new map<string,string>();
            mergeFieldsData.put('KeySet', appraisal.Id);
            mergeFieldsData.put('AppraiserName', appraisal.AppraiserName__c);
            mergeFieldsData.put('AppraiseeName', appraisal.EmployeeMaster__r.Name);
            mergeFieldsData.put('EndDate', string.valueOf(appraisal.End_Date__c));
            mergeFieldsData.put('TriggerName','SubmittoAppraiserSelf');
            listEmail.add(appraisal.EmployeeMaster__r.Email);
            emailTemplateMap.put(mergeFieldsData,listEmail);
            CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
            
        } 
        if (updateResults[0].isSuccess()) 
        {
            Map<Map<String, String>,List<string>> emailTemplateMap = new Map<Map<String, String>,List<string>>(); 
            map<string,string> mergeFieldsData = new map<string,string>();
            mergeFieldsData.put('KeySet', appraisal.Id);
            mergeFieldsData.put('AppraiserName', appraisal.AppraiserName__c);
            mergeFieldsData.put('AppraiseeName', appraisal.EmployeeMaster__r.Name);
            mergeFieldsData.put('EndDate', string.valueOf(appraisal.End_Date__c));
            mergeFieldsData.put('TriggerName','Submit_to_Appraiser');
            listEmail2.add(appraisal.EmployeeMaster__r.Appraiser__r.Email);
            emailTemplateMap.put(mergeFieldsData,listEmail2);
            CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
            
        } 
        else 
        { 
            System.debug('Record failed to update. Error message: ' + updateResults[0].getErrors()[0].getMessage());
        }
        
        
        return appraisal;
        
    }
    /**
* @description Method to updateRecordSent.
* @param record Object
* @return Evaluation__c
*/
    @AuraEnabled
    public static string updateRecordSent(Evaluation__c record ) {
        
        update record;
        
        return 'Success';
    }
    /**
* @description Method to insertAddhocRecord.
* @param record Object
* @return Evaluation__c
*/
    @AuraEnabled
    public static string insertAddhocRecord(Task_Tracker__c record ) {
        Id recordTypeId = Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        record.RecordTypeId=recordTypeId;
        insert record;
        
        return 'Success';
    }
    /**
* @description Method to updateAppraisalFormStatus.
* @param evlId string
*/
    @AuraEnabled
    public static void updateAppraisalFormStatus(String evlId) {
        
        Evaluation__c appraisal = [SELECT Id, Status__c, AppraiserName__c,ReviewerName__c,End_Date__c,EmployeeMaster__r.Email,EmployeeMaster__r.Name,EmployeeMaster__r.Reviewer__r.Email FROM Evaluation__c WHERE Id =:evlId with SECURITY_ENFORCED];
        if(appraisal.Status__c == 'Submitted by Appraiser') {
            appraisal.Status__c = 'Pending with Reviewer';
            // update appraisal;
        }
        List<string> listEmail = new List<string>();
          List<string> listEmail2 = new List<string>();
        List<database.Saveresult> updateresults =database.Update( new list<evaluation__c>{appraisal}, false);
        if (updateResults[0].isSuccess()) 
        {
            Map<Map<String, String>,List<string>> emailTemplateMap = new Map<Map<String, String>,List<string>>(); 
            map<string,string> mergeFieldsData = new map<string,string>();
            mergeFieldsData.put('KeySet', appraisal.Id);
            mergeFieldsData.put('ReviewerName', appraisal.ReviewerName__c);
            mergeFieldsData.put('AppraiseeName', appraisal.EmployeeMaster__r.Name);
            mergeFieldsData.put('TriggerName','Sent_for_Review');
            listEmail.add(appraisal.EmployeeMaster__r.Email);
            emailTemplateMap.put(mergeFieldsData,listEmail);
            CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
            
        } 
        if (updateResults[0].isSuccess()) 
        {
            Map<Map<String, String>,List<string>> emailTemplateMap = new Map<Map<String, String>,List<string>>(); 
            map<string,string> mergeFieldsData = new map<string,string>();
            mergeFieldsData.put('KeySet', appraisal.Id);
            mergeFieldsData.put('ReviewerName', appraisal.ReviewerName__c);
            mergeFieldsData.put('AppraiseeName', appraisal.EmployeeMaster__r.Name);
            mergeFieldsData.put('EndDate', string.valueOf(appraisal.End_Date__c));
            mergeFieldsData.put('TriggerName','Sent_for_Reviewer');
            listEmail2.add(appraisal.EmployeeMaster__r.Reviewer__r.Email);
            emailTemplateMap.put(mergeFieldsData,listEmail2);
            CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
            
        } 
        else 
        { 
            System.debug('Record failed to update. Error message: ' + updateResults[0].getErrors()[0].getMessage());
        }
        
        
    }
    /**
* @description Method to updateAppraisalFormGrivence.
* @param evlId string
* @param gcomment string
*/
   /* @AuraEnabled
    public static void updateAppraisalFormGrivence(String evlId, string gcomment) {
        
        Evaluation__c appraisal = [SELECT Id, Status__c, GrievenceComment__c,AppraiserName__c,EmployeeMaster__r.Appraiser__c,EmployeeMaster__r.Reviewer__c,EmployeeMaster__r.Name,End_Date__c,EmployeeMaster__r.Email, EmployeeMaster__r.Appraiser__r.Email,EmployeeMaster__r.Reviewer__r.Email FROM Evaluation__c WHERE Id =:evlId with SECURITY_ENFORCED];
        if(appraisal.Status__c =='Final Rating Available'){
            appraisal.Status__c ='Grievance Raised';
            appraisal.GrievenceComment__c=gcomment;
        }
        List<string> listEmail = new List<string>();
         List<string> listEmail2 = new List<string>();
        List<database.Saveresult> updateresults =database.Update( new list<evaluation__c>{appraisal}, false);
        if (updateResults[0].isSuccess()) 
        {
            Map<Map<String, String>,List<string>> emailTemplateMap = new Map<Map<String, String>,List<string>>(); 
            map<string,string> mergeFieldsData = new map<string,string>();
            mergeFieldsData.put('KeySet', appraisal.Id);
            mergeFieldsData.put('AppraiseeName', appraisal.EmployeeMaster__r.Name);
            mergeFieldsData.put('TriggerName','Grievance_request');
            listEmail.add(appraisal.EmployeeMaster__r.Email);
            emailTemplateMap.put(mergeFieldsData,listEmail);
            CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
            
        } 
        if (updateResults[0].isSuccess()) 
        {
            Map<Map<String, String>,List<string>> emailTemplateMap = new Map<Map<String, String>,List<string>>(); 
            map<string,string> mergeFieldsData = new map<string,string>();
            mergeFieldsData.put('KeySet', appraisal.Id);
            mergeFieldsData.put('AppraiseeName', appraisal.EmployeeMaster__r.Name);
            mergeFieldsData.put('TriggerName','Grievance_Request_to_All');
            listEmail2.add(appraisal.EmployeeMaster__r.Email);
            if(appraisal.EmployeeMaster__r.Appraiser__c!=null){
                listEmail2.add(appraisal.EmployeeMaster__r.Appraiser__r.Email);
            }
            if(appraisal.EmployeeMaster__r.Reviewer__c!=null){
                listEmail2.add(appraisal.EmployeeMaster__r.Reviewer__r.Email);
            }
            emailTemplateMap.put(mergeFieldsData,listEmail2);
            CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
            
        } 
        else 
        { 
            System.debug('Record failed to update. Error message: ' + updateResults[0].getErrors()[0].getMessage());
        }
        
    }*/
    /**
* @description Method to updateAppraisalFormClose.
* @param evlId string
* @param closurecomment string
*/
/*    @AuraEnabled
    public static void updateAppraisalFormClose(String evlId,string closurecomment) {
        
        Evaluation__c appraisal = [SELECT Id, Status__c, AppraiserName__c,ReviewerName__c,End_Date__c,EmployeeMaster__r.Email,EmployeeMaster__r.Name FROM Evaluation__c WHERE Id =:evlId with SECURITY_ENFORCED];
        if(appraisal.Status__c =='Final Rating Available' ){
            appraisal.Status__c ='Closed';
            appraisal.ClosureComments__c=closurecomment;
            
        }
        List<string> listEmail = new List<string>();
        List<database.Saveresult> updateresults =database.Update( new list<evaluation__c>{appraisal}, false);
        if (updateResults[0].isSuccess()) 
       {
            Map<Map<String, String>,List<string>> emailTemplateMap = new Map<Map<String, String>,List<string>>(); 
            map<string,string> mergeFieldsData = new map<string,string>();
            mergeFieldsData.put('KeySet', appraisal.Id);
            mergeFieldsData.put('AppraiseeName', appraisal.EmployeeMaster__r.Name);
            mergeFieldsData.put('TriggerName','Closing_the_Appraisal_form');
            listEmail.add(appraisal.EmployeeMaster__r.Email);
            emailTemplateMap.put(mergeFieldsData,listEmail);
            system.debug('EmailTemplateMap'+emailTemplateMap);
            CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
            
        } 
        else 
        { 
            System.debug('Record failed to update. Error message: ' + updateResults[0].getErrors()[0].getMessage());
        }
        
        
    }*/
    
    /**
* @description Method to getAllAttachmentRecords.
* @param kpiId string
* @return List<Attchment__c>
*/
    @AuraEnabled
    public static List<Attchment__c> getAllAttachmentRecords(string kpiId){
        List<Attchment__c> attachmentData = [Select Id, Name, File_Path__c, Item_Id__c, One_Drive_URL__c,File_Type__c,  Parent_Id__c, File_Size__c from Attchment__c where Parent_Id__c =:kpiId];
        return attachmentData;
    }
    
   /* @param evlId string
* @param band string
* @param des string
* @return List<Task_Tracker__c>
*/
    @AuraEnabled
    public static List<Task_Tracker__c> getTransferedTaskList(Id employeeId) {
        Id recordTypeIdTask =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        return [SELECT 
        id,name,Employee_Name__r.name, KpiProvider__c, KpiProvider__r.Name,KpiStatus__c,Employee_Name__c ,EmployeeMaster__r.Name,Evaluation__c from Task_Tracker__c
                WHERE RecordTypeId=:recordTypeIdTask AND KpiProvider__c =:employeeId AND KpiStatus__c='KPI Transferred'
                WITH SECURITY_ENFORCED];
    }
    /* 
* @param taskId Id
* @return Task_Tracker__c
*/
@AuraEnabled
public static Task_Tracker__c getTaskInfo(Id taskId) {
    Id recordTypeIdTask =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
    return [SELECT 
    id,name,Employee_Name__r.name, KpiProvider__c, KpiProvider__r.Name,KpiStatus__c,Employee_Name__c ,Weightage__c, EmployeeMaster__r.Name,Evaluation__c,SelfRating__c,
    Appraiser_Rating__c, Appraiser_Feedback__c, Challenges__c,Justification__c, Appraiser_Weightage_for_Each_KPIs__c,KPI_Name__c,MaxWeightage__c, MinWeightage__c  
    from Task_Tracker__c WHERE Id=:taskId WITH SECURITY_ENFORCED];
}
   

}