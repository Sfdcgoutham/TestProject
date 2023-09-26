@isTest
public without sharing class CCT_PMSReviewer_Test {
    
    /**
    * @description Method to setup the test data.
    */
    @TestSetup
    public static void setup(){

        Account acc=new Account();
        acc.Name='Claudtaru';
        insert acc;
        
        PU_DU__c profitunit=new PU_DU__c();
        profitunit.No_of_Employees_In_This_PU__c = 20;
        profitunit.name = 'PU';
        String recordTypeIdpudu =Schema.SObjectType.PU_DU__c.getRecordTypeInfosByName().get('PU').getRecordTypeId();
        profitunit.RecordTypeId=RecordTypeIdpudu;
        insert profitunit;
        
        PU_DU__c du1=new PU_DU__c();
        du1.Name='DU1';
        du1.Profit_Unit__c = profitunit.id;
        String recordTypeIdpudu1 =Schema.SObjectType.PU_DU__c.getRecordTypeInfosByName().get('DU').getRecordTypeId();
        du1.RecordTypeId = RecordTypeIdpudu1;
        du1.No_of_Employees_In_This_DU__c=10;
        insert du1;
        
        Id recordTypeIdCandidate =Schema.SObjectType.Contact.getRecordTypeInfosByDeveloperName().get('Candidate').getRecordTypeId();

        Contact empl=new Contact();
        empl.AccountId=acc.Id;
        empl.Salutation='Mr.';
        empl.FirstName='Syamala';
        empl.LastName='Siri';
        empl.RecordTypeId=recordTypeIdCandidate;
        empl.Active__c=true;
        empl.Employee_Joining_Date__c=date.today().addMonths(-10);
        empl.Role__c='HR';
        empl.EmployeeNo__c='CT-0124';
        empl.Employee_State__c='Andhra Pradesh';
        empl.Aadhar_Number__c='145623209834';
        empl.Account_Number__c='123556889987';
        empl.Employee_Id__c='CT-8746';
        empl.IFSC_Code__c='SBIN0123457';
        empl.MobilePhone='8614123124';
        empl.Phone='7614123124';
        empl.PAN_Number__c='MJAPS1145H';
        empl.PU_DU__c=du1.id;
        empl.Email='gouthamboini@gmail.com';
        empl.Designation__c = 'None';
        empl.Band__c = 'Band C';
       
        insert empl;
        
        Contact emp=new Contact();
        emp.AccountId=acc.Id;
        emp.Salutation='Mr.';
        emp.FirstName='Vignesh';
        emp.LastName='Shrinivas';
        emp.Active__c=true;
        emp.Employee_Joining_Date__c=date.today().addMonths(-10);
        emp.Role__c='HR';
        emp.EmployeeNo__c='CT-0123';
        emp.Employee_State__c='Andhra Pradesh';
        emp.Aadhar_Number__c='145623209838';
        emp.Account_Number__c='123456889987';
        emp.Employee_Id__c='CT-8745';
        emp.IFSC_Code__c='SBIN0123456';
        emp.MobilePhone='9614123124';
        emp.Phone='9614123124';
        emp.PAN_Number__c='MJAPS1145J';
        emp.PU_DU__c=du1.id;
        emp.Email='guestuser@gmail.com';
        emp.Designation__c = 'None';
        emp.Band__c = 'Band C';
        emp.Appraiser__c = empl.Id;
        emp.Reviewer__c = empl.Id;
        insert emp;

        Contact emp1=new Contact();
        emp1.AccountId=acc.Id;
        emp1.Salutation='Mr.';
        emp1.FirstName='Vignesh';
        emp1.LastName='Shrinivas';
        emp1.Active__c=true;
        emp1.Employee_Joining_Date__c=date.today().addMonths(-10);
        emp1.Role__c='HR';
        emp1.EmployeeNo__c='emp124';
        emp1.Employee_State__c='Andhra Pradesh';
        emp1.Aadhar_Number__c='145623209835';
        emp1.Account_Number__c='123456889985';
        emp1.Employee_Id__c='CT-8747';
        emp1.IFSC_Code__c='SBIN0123458';
        emp1.MobilePhone='9614123128';
        emp1.Phone='9614123125';
        emp1.PAN_Number__c='MJAPS1145K';
        emp1.PU_DU__c=du1.id;
        emp1.Email='guestuser1@gmail.com';
        emp1.Designation__c = 'None';
        emp1.Band__c = 'Band C';
        emp.Appraiser__c = empl.Id;
        emp1.Reviewer__c = emp.Id;
        insert emp1;

        Evaluation__c evaluation = new Evaluation__c();
        evaluation.Status__c = 'Pending with Reviewer';
        evaluation.Name = 'Madhav Appraisal';
        evaluation.AppraiserFeedback__c = 'Appraisal Completed';
        evaluation.AppraiserRating__c = 3;
        evaluation.EmployeeMaster__c = emp.Id;
        insert evaluation;
    }

    @isTest
    public static void getReviewerRecordsTest(){
        Contact emp = [Select Id, Name from Contact limit 1];
        Evaluation__c evaluation = [Select Id, Name from Evaluation__c Limit 1];
        CCT_PMSReviewer.getReviewerRecords(emp.Id);
        CCT_PMSReviewer.getAppraisalRecord(evaluation.Id);
        CCT_PMSReviewer.getAllAppraisalRecords(emp.Id);
        CCT_PMSReviewer.getAppraisalStatusRecordCounts(emp.Id);
        CCT_PMSReviewer.getEmployeeRecord(emp.Id);
        CCT_PMSReviewer.UpdateAppraisal(evaluation.Id, 4, 'NA', true);
        CCT_PMSReviewer.finalizeAppraisal(evaluation.Id);
        CCT_PMSReviewer.getIndividualAppraisalRecord(evaluation.Id);
        System.assert(1==1);
    }

    @isTest
    public static void getEndDate(){
        Appraisal_Cycles__mdt appraisalEndDate = [Select Id, End_Date__c, Appraisal_Cycle_Name__c, Label, MasterLabel,DeveloperName from Appraisal_Cycles__mdt where DeveloperName = 'Annual_6'];
        CCT_PMSReviewer.getAppraisalEndDate();
        System.assert(1==1);
    }
}