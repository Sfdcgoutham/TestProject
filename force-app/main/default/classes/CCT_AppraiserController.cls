/**
* @author PMSDev02-sneha
* @description class to handle the CCT_PMSAppraiser records.
* @date 11/04/2023
*/
public without sharing class CCT_AppraiserController {
    /**
* @description Method to getAppraiserrRecords.
* @param employeeId string
* @return List<Evaluation__c>
*/
    @AuraEnabled
    public static List<Evaluation__c> getAppraiserRecords(string employeeId){
        try{
            List<Evaluation__c> evaluationData = [SELECT 
                                                  Id, Name, AppraiserFeedback__c,AppraisalCycle__c, AppraiserName__c, ReviewerName__c, AppraiserRating__c,ClosureComments__c,ConflictFlag__c,EligibilityForPromotion__c,EmployeeMaster__c, EmployeeMaster__r.Name,
                                                  JustificationForEligibility__c, OverallRating__c, PRD_Date_And_Time_Appraiser__c,PRD_Duration_Appraiser__c,PRD_With_Appraisee_Is_Done__c,
                                                  ReviewerFeedback__c, ReviewerRating__c, Status__c, SubmittedDate__c, WhatCanBeDoneBetter__c, WhatHappenedWell__c,AppraiserComments__c
                                                  FROM Evaluation__c where (Status__c =:CCT_Kriya_Constants.SUBMITTED_STATUS OR Status__c = :CCT_Kriya_Constants.AUTOSUBMITTED_STATUS) and EmployeeMaster__r.Appraiser__c = :employeeId ];
            
            return evaluationData;
        } catch (exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    
    
    @AuraEnabled
    public static string updateRecord(Evaluation__c record ) {
        System.debug(record);
        System.debug(record.PRD_Date_And_Time_Appraiser__c);
        update record;
        return 'Success';
    }
    
    
    @AuraEnabled
    public static List<Contact> getAppraiseeList(string employeeId, string role){
        try{
            System.debug('Role :- '+role);
            List<Contact> appraiseeList = new List<Contact>();
            if(role == 'appraiser'){
                appraiseeList = [SELECT Id, Employee_Joining_Date__c, Name, Designation__c, Band__c,Status__c,Appraiser__c,Reviewer__c,AppraisalCycle__c,Email FROM Contact WHERE Appraiser__c = :employeeId ];
            } else if(role == 'reviewer'){
                appraiseeList = [SELECT Id, Employee_Joining_Date__c, Name, Designation__c, Band__c,Status__c,Appraiser__c,Reviewer__c,AppraisalCycle__c,Email FROM Contact WHERE Reviewer__c = :employeeId ];
            }
            return appraiseeList;
        } catch (exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    /**
* @description Method to getAppraisalRecord.
* @param recordId string
* @return Evaluation__c
*/
    @AuraEnabled
    public static Evaluation__c getAppraiserRecord(string recordId){
        try{
            Evaluation__c evaluationData = [SELECT 
                                            Id, Name, AppraiserFeedback__c, AppraiserName__c, ReviewerName__c, AppraiserRating__c,ClosureComments__c,ConflictFlag__c,EligibilityForPromotion__c,EmployeeMaster__c, EmployeeMaster__r.Name,
                                            JustificationForEligibility__c,OverallRating__c,PRD_Date_And_Time_Appraiser__c,PRD_Duration_Appraiser__c,PRD_With_Appraisee_Is_Done__c,AppraiserComments__c,
                                            ReviewerFeedback__c, ReviewerRating__c, Status__c, SubmittedDate__c, WhatCanBeDoneBetter__c, WhatHappenedWell__c,AppraisalCycle__c
                                            FROM Evaluation__c where /*Status__c =:CCT_Kriya_Constants.SUBMITTED_STATUS and */  Id = :recordId ];
            
            return evaluationData;
        } catch (exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    /**
* @description Method to getAllAppraisalRecords.
* @param employeeId string
* @return List<Evaluation__c> 
*/
    @AuraEnabled
    public static List<Evaluation__c> getAllAppraiserRecords(string employeeId){
        try{
            List<Evaluation__c> evaluationData = [SELECT 
                                                  Id, Name, AppraiserFeedback__c, AppraiserName__c, ReviewerName__c, AppraiserRating__c,ClosureComments__c,ConflictFlag__c,EligibilityForPromotion__c,EmployeeMaster__c, EmployeeMaster__r.Name,
                                                  JustificationForEligibility__c, OverallRating__c,PRD_Date_And_Time_Appraiser__c,PRD_Duration_Appraiser__c,PRD_With_Appraisee_Is_Done__c,EmployeeMaster__r.Designation__c,
                                                  ReviewerFeedback__c, ReviewerRating__c, Status__c, SubmittedDate__c, WhatCanBeDoneBetter__c, WhatHappenedWell__c,AppraisalCycle__c,AppraiserComments__c
                                                  FROM Evaluation__c where EmployeeMaster__r.Appraiser__c = :employeeId AND Status__c !=NULL ];
            
            return evaluationData;
        } catch (exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    /**
* @description Method to getAppraisalStatusRecordCounts.
* @param employeeId string
* @return AggregateResult[]
*/
    @AuraEnabled
    public static AggregateResult[] getAppraiserStatusRecordCounts(string employeeId){
        try{
            AggregateResult[] statusCounts = [select COUNT(ID) statusCount, Status__c from Evaluation__c where Status__c!=NULL and EmployeeMaster__r.Appraiser__c = :employeeId  group by Status__c];
            return statusCounts;
        } catch (exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    /**
* @description Method to getAppraisalEndDate.
* @return Appraisal_Cycles__mdt
*/
    @AuraEnabled
    public static Appraisal_Cycles__mdt getAppraiserEndDate(){
        try{
            Appraisal_Cycles__mdt appraisalEndDate = [Select Id, End_Date__c,Appraisal_Cycle_Name__c, Label, MasterLabel,DeveloperName from Appraisal_Cycles__mdt where DeveloperName =:CCT_Kriya_Constants.ANNUAL_3 ];
            return appraisalEndDate;
        } catch (exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    
    /**
* @description Method to fetch TermCycle Records.
* @param appraiserId string
* @param appraisalCycle string
* @return List<Evaluation__c>
*/
    
    @AuraEnabled
    public static List<Task_Tracker__c> fetchAppraisalForm( string des){
        Id recordTypeId =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('KPI').getRecordTypeId();
        
        return [SELECT Id, KPI_Name__c, Objectives_And_Key_Results__c,MaxWeightage__c, MinWeightage__c, Weightage__c, Rating__c, Justification__c
                FROM Task_Tracker__c where KPICategory__c!= null and recordTypeId=:recordTypeId and Designation__c =:des and
                Active__c =true   ORDER By KPICategory__c ];
        
    }  
    /**
* @description Method to fetch TermCycle Records.
* @param appraiserId string
* @param appraisalCycle string
* @return List<Evaluation__c>
*/
    @AuraEnabled
    public static List<Evaluation__c> fetchTermCycleRecords( string appraiserId, String appraisalCycle){
        if(appraisalCycle == 'AnnualCycle'){
            return [SELECT  Id, Name, Start_Date__c, End_Date__c,Status__c, EmployeeMaster__r.Name,EmployeeMaster__r.Employee_Joining_Date__c, AppraisalCycle__c
                    FROM Evaluation__c  where Start_Date__c <= TODAY AND Start_Date__c>LAST_N_YEARS:3 AND  AppraisalCycle__c=:appraisalCycle
                    AND EmployeeMaster__c =:appraiserId];
        }
        if(appraisalCycle == 'MidTermCycle'){
            return [SELECT  Id, Name, Start_Date__c, End_Date__c,Status__c, EmployeeMaster__r.Name,EmployeeMaster__r.Employee_Joining_Date__c, AppraisalCycle__c
                    FROM Evaluation__c  where Start_Date__c <= TODAY AND Start_Date__c>LAST_N_YEARS:1 AND  AppraisalCycle__c=:appraisalCycle
                    AND EmployeeMaster__c =:appraiserId];
        }
        return null;
        //Start Date <today - 3years && Type = Annual
        // OR
        //Start Date < today - 1 Year && Type = Mid-Year
        
    }
    
    
    @AuraEnabled
    public static void updateAppraisalFormStatus(Id appraisalId) {
        List<string> listEmail = new List<string>();
        Evaluation__c appraisal = [SELECT Id, Status__c, AppraiserName__c,End_Date__c,EmployeeMaster__r.Email,EmployeeMaster__r.Name FROM Evaluation__c WHERE Id =: appraisalId];
        if(appraisal.Status__c == 'Submitted') {
            appraisal.Status__c = 'Submitted by Appraiser';
            // update appraisal;
        } else if(appraisal.Status__c == 'Auto Submitted'){
            appraisal.Status__c = 'Pending with Reviewer';
        }
        
        
        List<database.Saveresult> updateresults =database.Update(new list<evaluation__c>{appraisal}, false);
        if (updateResults[0].isSuccess()) 
        { 
            //sendEmail('Signed_By_Appraiser',mapData);
            Map<Map<String, String>,List<string>> emailTemplateMap = new Map<Map<String, String>,List<string>>();
            map<string,string> mergeFieldsData = new map<string,string>();
            mergeFieldsData.put('KeySet', appraisal.Id);
            mergeFieldsData.put('AppraiserName', appraisal.AppraiserName__c);
            mergeFieldsData.put('AppraiseeName',appraisal.EmployeeMaster__r.Name);
            mergeFieldsData.put('EndDate', string.valueOf(appraisal.End_Date__c));
            mergeFieldsData.put('TriggerName','Signed_By_Appraiser_Template');
            listEmail.add(appraisal.EmployeeMaster__r.Email);
            emailTemplateMap.put(mergeFieldsData,listEmail);
             system.debug('EmailTemplateMap'+emailTemplateMap);
            CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
         //   CCT_PMS_EmailTemplateFramework.sendCustomNotification('Signed By Appraiser',listEmail,mergeFieldsData);//TRigger Nane
            
            System.debug('Record updated successfully. ID: ' + updateResults[0].getId()); 
        } 
        else 
        { 
            System.debug('Record failed to update. Error message: ' + updateResults[0].getErrors()[0].getMessage());
        }
    }
    @AuraEnabled
 public static Double calculateSumOfTask(string evlId){
    Id recordTypeId =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
    List<Task_Tracker__c> evaluationData = [SELECT  Id, Name,Active__c,Average_Allocation_for_the_time_perdiod__c,Band__c,Challenges__c,Designation__c,Evaluation__c,
    Justification__c,MaxWeightage__c,KPICategory__c,KPI_Name__c,Mandatory__c,Measurement_Criteria_Description__c,MinWeightage__c,
    Rating__c,SelfRating__c,Task_Description__c,Weightage__c,Objectives_And_Key_Results__c,Appraiser_Rating__c,Appraiser_Weightage_for_Each_KPIs__c
    FROM Task_Tracker__c where Evaluation__c =:evlId and recordTypeId=:recordTypeId  ];
    Double totalWeightage = 0;
    for( Task_Tracker__c tsum : evaluationData){
        if(tsum.Appraiser_Weightage_for_Each_KPIs__c!=null){
        totalWeightage += tsum.Appraiser_Weightage_for_Each_KPIs__c;
        }
    }
      return totalWeightage;
 }
    
}