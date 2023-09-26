@isTest
public without sharing class CCT_AppraiserController_Test {
    
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
        empl.Aadhar_Number__c='175623209834';
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
    public static void getAppraiserRecordsTest(){
        Contact emp = [Select Id, Name from Contact limit 1];
        Evaluation__c evaluation = [Select Id, Name,Status__c from Evaluation__c Limit 1];
        evaluation.Status__c = 'Submitted';
        update evaluation;
        system.debug(evaluation);
        CCT_AppraiserController.getAppraiserRecords(emp.Id);
        CCT_AppraiserController.getAppraiserRecord(evaluation.Id);
        CCT_AppraiserController.getAllAppraiserRecords(emp.Id);
        CCT_AppraiserController.getAppraiserStatusRecordCounts(emp.Id);
    }
    
    @isTest
    public static void getEndDate(){
        Appraisal_Cycles__mdt appraisalEndDate = [Select Id, End_Date__c, Appraisal_Cycle_Name__c, Label, MasterLabel,DeveloperName from Appraisal_Cycles__mdt where DeveloperName = 'Annual_6'];
        CCT_AppraiserController.getAppraiserEndDate();
    }
    @isTest
    public static void TryAndCatchTest(){
        Contact emp = [Select Id, Name from Contact limit 1];
        Evaluation__c evaluation = [Select Id, Status__c from Evaluation__c Limit 1];
        evaluation.Status__c = 'Auto Submitted';
        update evaluation;
        system.debug(evaluation);
        try{
            CCT_AppraiserController.getAppraiserRecords(emp.Id);
            CCT_AppraiserController.getAppraiserRecord(evaluation.Id);
            CCT_AppraiserController.getAllAppraiserRecords(emp.Id);
            CCT_AppraiserController.getAppraiserStatusRecordCounts(emp.Id);
            CCT_AppraiserController.fetchAppraisalForm(emp.Id);
            CCT_AppraiserController.updateAppraisalFormStatus(emp.Id);
            CCT_AppraiserController.calculateSumOfTask(emp.Id);
        } catch (Exception ex){
            
        } }
    
    @isTest
    public static void fetchTermCycleRecordsTest() {
        Contact emp = [SELECT Id FROM Contact LIMIT 1];
        List<Evaluation__c> annualCycleRecords = CCT_AppraiserController.fetchTermCycleRecords(emp.Id, 'AnnualCycle');
        List<Evaluation__c> midTermCycleRecords = CCT_AppraiserController.fetchTermCycleRecords(emp.Id, 'MidTermCycle');    }
    
    @isTest
    public static void getAppraiseeListTest() {
        Contact emp = [SELECT Id FROM Contact LIMIT 1];
        List<Contact> appraiseeListAppraiser = CCT_AppraiserController.getAppraiseeList(emp.Id, 'appraiser');
        List<Contact> appraiseeListReviewer = CCT_AppraiserController.getAppraiseeList(emp.Id, 'reviewer');
    }
    @isTest
    public static void updateRecordTest() {
        Evaluation__c evaluation = new Evaluation__c();
        evaluation.Status__c = 'Auto Submitted';
        evaluation.AppraiserFeedback__c = 'Sample Feedback';
        evaluation.AppraisalCycle__c = 'AnnualCycle';
        insert evaluation;
        evaluation.AppraiserFeedback__c = 'Updated Feedback';
        Test.startTest();
        String result = CCT_AppraiserController.updateRecord(evaluation);
        Test.stopTest();
        Evaluation__c updatedEvaluation = [SELECT AppraiserFeedback__c FROM Evaluation__c WHERE Id = :evaluation.Id];
    }
    @isTest
    public static void calculateSumOfTaskTest() {
        
        Evaluation__c evaluation = new Evaluation__c();
        insert evaluation;
        Task_Tracker__c task1 = new Task_Tracker__c();
        task1.Evaluation__c = evaluation.Id;
        task1.Appraiser_Weightage_for_Each_KPIs__c = 5;
        insert task1;
        
        Task_Tracker__c task2 = new Task_Tracker__c();
        task2.Evaluation__c = evaluation.Id;
        task2.Appraiser_Weightage_for_Each_KPIs__c = 8;
        insert task2;
        Test.startTest();
        Double totalWeightage = CCT_AppraiserController.calculateSumOfTask(evaluation.Id);
        Test.stopTest();
    }
      @isTest
    public static void updateAppraisalFormStatusTest() {
        Evaluation__c evaluation = new Evaluation__c();
        evaluation.Status__c = 'Submitted';
        insert evaluation;
        Test.startTest();
        CCT_AppraiserController.updateAppraisalFormStatus(evaluation.Id);
        Test.stopTest();
        Evaluation__c updatedEvaluation = [SELECT Id, Status__c FROM Evaluation__c WHERE Id = :evaluation.Id];
        evaluation.Status__c = 'Auto Submitted';
        update evaluation;
       // Test.startTest();
        CCT_AppraiserController.updateAppraisalFormStatus(evaluation.Id);
       // Test.stopTest();
        updatedEvaluation = [SELECT Id, Status__c FROM Evaluation__c WHERE Id = :evaluation.Id];
    }
}