/**
 * @author PMSDev02
 * @description class to handle the CCT_PMSReviewer records.
 * @date 11/04/2023
 */
public without sharing class CCT_PMSReviewer {
    /**
    * @description Method to getReviewerRecords.
    * @param employeeId string
    * @return List<Evaluation__c>
    */
    @AuraEnabled
    public static List<Evaluation__c> getReviewerRecords(string employeeId){
        List<Evaluation__c> evaluationData = [SELECT 
        Id, Name, AppraiserFeedback__c, AppraiserName__c, AppraiserComments__c, AppraisalCycle__c, ReviewerName__c, AppraiserRating__c,ConflictFlag__c,EligibilityForPromotion__c,EmployeeMaster__c, EmployeeMaster__r.Name,
        JustificationForEligibility__c, OverallComments__c, OverallRating__c, PRDDateAndTime__c, PRDWithAppraiserIsDone__c,
        ReviewerFeedback__c, ReviewerRating__c, Status__c, SubmittedDate__c, WhatCanBeDoneBetter__c, WhatHappenedWell__c 
        FROM Evaluation__c where Status__c = 'Pending with Reviewer' and EmployeeMaster__r.Reviewer__c = :employeeId ];

        return evaluationData;
    }

    /**
    * @description Method to getAppraisalRecord.
    * @param recordId string
    * @return Evaluation__c
    */
    @AuraEnabled(cacheable = true)
    public static Evaluation__c getAppraisalRecord(string recordId){
        Evaluation__c evaluationData = [SELECT 
        Id, Name, AppraiserFeedback__c, AppraiserName__c, AppraiserComments__c, AppraisalCycle__c, ReviewerName__c, AppraiserRating__c,ConflictFlag__c,EligibilityForPromotion__c,EmployeeMaster__c, EmployeeMaster__r.Name,
        JustificationForEligibility__c, OverallComments__c, OverallRating__c, PRDDateAndTime__c, PRDDuration__c, PRDWithAppraiserIsDone__c,
        ReviewerFeedback__c, ReviewerRating__c, Status__c, SubmittedDate__c, WhatCanBeDoneBetter__c, WhatHappenedWell__c,
        PRD_Date_And_Time_Appraiser__c, PRD_Duration_Appraiser__c, PRD_With_Appraisee_Is_Done__c, ApraiseeOverallRating__c 
        FROM Evaluation__c where Status__c = 'Pending with Reviewer' and Id = :recordId ];

        return evaluationData;
    }

    /**
    * @description Method to getAllAppraisalRecords.
    * @param employeeId string
    * @return List<Evaluation__c>
    */
    @AuraEnabled
    public static List<Evaluation__c> getAllAppraisalRecords(string employeeId){
        List<Evaluation__c> evaluationData = [SELECT 
        Id, Name, AppraiserFeedback__c, AppraiserName__c, AppraisalCycle__c, ReviewerName__c, AppraiserRating__c,ConflictFlag__c,EligibilityForPromotion__c,EmployeeMaster__c, EmployeeMaster__r.Name,
        JustificationForEligibility__c, OverallComments__c, OverallRating__c, PRDDateAndTime__c, PRDDuration__c, PRDWithAppraiserIsDone__c,
        ReviewerFeedback__c, ReviewerRating__c, Status__c, SubmittedDate__c, WhatCanBeDoneBetter__c, WhatHappenedWell__c,
        PRD_Date_And_Time_Appraiser__c, PRD_Duration_Appraiser__c, PRD_With_Appraisee_Is_Done__c, ApraiseeOverallRating__c
        FROM Evaluation__c where EmployeeMaster__r.Reviewer__c = :employeeId ];

        return evaluationData;
    }

    /**
    * @description Method to getAppraisalStatusRecordCounts.
    * @param employeeId string
    * @return AggregateResult[]
    */
    @AuraEnabled(cacheable = true)
    public static AggregateResult[] getAppraisalStatusRecordCounts(string employeeId){
        AggregateResult[] statusCounts = [select COUNT(ID) statusCount, Status__c from Evaluation__c where Status__c !='' and EmployeeMaster__r.Reviewer__c = :employeeId  group by Status__c];
        return statusCounts;
    }

    /**
    * @description Method to getAppraisalEndDate.
    * @return Appraisal_Cycles__mdt
    */
    @AuraEnabled(cacheable = true)
    public static Appraisal_Cycles__mdt getAppraisalEndDate(){
        Appraisal_Cycles__mdt appraisalEndDate = [Select Id, End_Date__c, Appraisal_Cycle_Name__c, Label, MasterLabel,DeveloperName from Appraisal_Cycles__mdt where DeveloperName = 'Annual_6' ];
        return appraisalEndDate;
    }

    /**
    * @description Method to getEmployeeRecord.
    * @param employeeId string
    * @return Contact
    */
    @AuraEnabled(cacheable = true)
    public static List<Contact> getEmployeeRecord(string employeeId){
        List<Contact> employee = [SELECT Id, Name, (SELECT Id from Employee_Master1__r limit 1), (SELECT Id from Employee_Master2__r limit 1 ) from Contact where Id = :employeeId ];
        return employee;
    }

    /**
     * @date 25/04/2023
     * @description Method to updateAppraisal.
     * @param recordId String
     * @param overallRating Double
     * @param overallComments String
     * @param eligibilityForPromotion boolean
     * @return Evaluation__c
     */
    @AuraEnabled
    public static Evaluation__c updateAppraisal(string recordId, Double overallRating, string overallComments, boolean eligibilityForPromotion){
        Evaluation__c evaluationRecord = new Evaluation__c();
        evaluationRecord.Id = recordId;
        evaluationRecord.OverallRating__c = overallRating;
        evaluationRecord.OverallComments__c= overallComments;
        evaluationRecord.EligibilityForPromotion__c = eligibilityForPromotion;
        update evaluationRecord;
        return evaluationRecord;
    }

        /**
     * @date 25/04/2023
     * @description Method to finalizeAppraisal.
     * @param recordId String
     */
    @AuraEnabled
    public static void finalizeAppraisal(string recordId){
        //Evaluation__c evaluationRecord = new Evaluation__c();
        Evaluation__c evaluationRecord = [SELECT Id, Status__c, ReviewerName__c,End_Date__c,EmployeeMaster__r.Email,EmployeeMaster__r.Name FROM Evaluation__c WHERE Id =:recordId];
        List<string> emailList = new List<string>();
        evaluationRecord.Id = recordId;
        evaluationRecord.Status__c = 'Final Rating Available';
        //update evaluationRecord;

        List<database.Saveresult> updateResults =database.Update(new list<evaluation__c>{evaluationRecord}, false);
        if (updateResults[0].isSuccess()) 
        {
            Map<Map<String, String>,List<string>> emailTemplateMap = new Map<Map<String, String>,List<string>>(); 
            map<string,string> mergeFieldsData = new map<string,string>();
            mergeFieldsData.put('KeySet', evaluationRecord.Id);
            mergeFieldsData.put('ReviewerName', evaluationRecord.ReviewerName__c);
            mergeFieldsData.put('AppraiseeName',evaluationRecord.EmployeeMaster__r.Name);
            mergeFieldsData.put('TriggerName','Final_Rating_Availabl_Template');
            //mergeFieldsData.put('EndDate', string.valueOf(evaluationRecord.End_Date__c));
            emailList.add(evaluationRecord.EmployeeMaster__r.Email);
            emailTemplateMap.put(mergeFieldsData,emailList);
            system.debug('EmailTemplateMap'+emailTemplateMap);
            CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
         
            //CCT_PMS_EmailTemplateFramework.sendCustomNotification('Final Rating Available',emailList,mergeFieldsData);//TRigger Nane
        } 
        else 
        { 
            System.debug('Record failed to update. Error message: ' + updateResults[0].getErrors()[0].getMessage());
        }
    }

    /**
    * @description Method to getIndividualAppraisalRecord.
    * @param recordId string
    * @return Evaluation__c
    */
    @AuraEnabled
    public static Evaluation__c getIndividualAppraisalRecord(string recordId){
        Evaluation__c evaluationData = [SELECT 
        Id, Name, AppraiserFeedback__c, AppraiserName__c, AppraiserComments__c, ReviewerName__c, AppraisalCycle__c, AppraiserRating__c,ConflictFlag__c,EligibilityForPromotion__c,EmployeeMaster__c, EmployeeMaster__r.Name,
        JustificationForEligibility__c, OverallComments__c, OverallRating__c, PRDDateAndTime__c, PRDDuration__c, PRDWithAppraiserIsDone__c,
        ReviewerFeedback__c, ReviewerRating__c, Status__c, SubmittedDate__c, WhatCanBeDoneBetter__c, WhatHappenedWell__c,
        PRD_Date_And_Time_Appraiser__c,IsAutoSubmit__c, PRD_Duration_Appraiser__c, PRD_With_Appraisee_Is_Done__c, ApraiseeOverallRating__c 
        FROM Evaluation__c where Id = :recordId ];

        return evaluationData;
    }

}