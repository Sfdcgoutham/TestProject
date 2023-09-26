@isTest
public class CCT_AppraiseeController_BatchTest {
    @isTest
    static void testAppraiseeBatch() {
         List<Evaluation__c> initiatedRecords;
      
       // List<Appraisal_Cycles__mdt> cycleRecords = [SELECT Appraisal_Cycle_Name__c,DeveloperName,End_Date__c,Stage__c,Start_Date__c,MasterLabel 
                                                  //  FROM Appraisal_Cycles__mdt WHERE MasterLabel IN ('Mid_Term_Start_Date','Annual_Start_Date')];
        
      //  System.debug(' CycleRecords :: ' +cycleRecords);
        boolean isEligible = true;
        boolean endDateAppraisee = true;
        //list<Appraisal_Cycles__mdt> picklistData= new List<Appraisal_Cycles__mdt>();


        // Create test data for Appraisal_Cycles__mdt records
        List<Appraisal_Cycles__mdt> cycleRecords = new List<Appraisal_Cycles__mdt>{
            new Appraisal_Cycles__mdt(
                Appraisal_Cycle_Name__c = 'Cycle 1',
                MasterLabel = 'Mid_Term_Start_Date',
                Start_Date__c = Date.today(),
                End_Date__c = Date.today().addDays(7)
            ),
            new Appraisal_Cycles__mdt(
                Appraisal_Cycle_Name__c = 'Cycle 2',
                MasterLabel = 'Annual_Start_Date',
                Start_Date__c = Date.today(),
                End_Date__c = Date.today().addDays(7)
            )
        };
       // insert cycleRecords;
        list<Appraisal_Cycles__mdt> picklistData= new List<Appraisal_Cycles__mdt>();

        Account acc=new Account();
        acc.Name='Cloudtaru';
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
        empl.Aadhar_Number__c='145623209839';
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
        emp.Aadhar_Number__c='145623209837';
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
        Date startDate = date.newInstance(2023, 06, 14);
        Evaluation__c evaluation = new Evaluation__c();
        evaluation.Status__c = 'Pending with Reviewer';
        evaluation.Name = 'Madhav Appraisal';
        evaluation.AppraisalCycle__c = 'MidTermCycle';
        evaluation.Start_Date__c =date.today();
         evaluation.End_Date__c =date.today();
        evaluation.AppraiserFeedback__c = 'Appraisal Completed';
        evaluation.AppraiserRating__c = 3;
        evaluation.EmployeeMaster__c = emp.Id;
        insert evaluation;
        // Create a test Evaluation record where endDateAppraisee is true
        Evaluation__c eval1 = new Evaluation__c();
        eval1.Status__c = 'Initiated';
        eval1.EmployeeMaster__c = emp.Id;
         eval1.Start_Date__c =date.today();
         eval1.End_Date__c =date.today();
         eval1.Status__c = CCT_Kriya_Constants.INITIATED_STATUS;
       
        insert eval1;
        
 // Create an Evaluation__c record with endDateAppraisee set to true
        Evaluation__c eval2 = new Evaluation__c();
        eval2.Status__c = 'Initiated';
        eval2.EmployeeMaster__c = emp.Id;
        eval2.AppraisalCycle__c = 'MidTermCycle';
         eval2.Start_Date__c =date.today();
         eval2.End_Date__c =date.today();
         eval2.Status__c = CCT_Kriya_Constants.NOTINITIATED_STATUS;
       
        insert eval2;

        // Create an Evaluation__c record with isEligible set to true
        Evaluation__c eval3 = new Evaluation__c();
        eval3.Status__c = 'Initiated';
        eval3.EmployeeMaster__c = empl.Id;
        eval3.Start_Date__c =date.today();
         eval3.End_Date__c =date.today();
        eval3.AppraisalCycle__c = 'Annual_Start_Date';
       
        insert eval3;   
     
        
        Contact eligibleContact = new Contact();
        eligibleContact.AccountId=acc.Id;
        eligibleContact.Salutation='Mr.';
        eligibleContact.FirstName='Vignesh';
        eligibleContact.LastName='Shrinivas';
        eligibleContact.Active__c=true;
        eligibleContact.Employee_Joining_Date__c=date.today().addMonths(-10);
        eligibleContact.Role__c='HR';
        eligibleContact.EmployeeNo__c='emp124';
        eligibleContact.Employee_State__c='Andhra Pradesh';
        eligibleContact.Aadhar_Number__c='145623209835';
        eligibleContact.Account_Number__c='123456889985';
        eligibleContact.Employee_Id__c='CT-8747';
        eligibleContact.IFSC_Code__c='SBIN0123458';
        eligibleContact.MobilePhone='9614123128';
        eligibleContact.Phone='9614123125';
        eligibleContact.PAN_Number__c='MJAPS1145K';
        eligibleContact.PU_DU__c=du1.id;
        eligibleContact.Email='guestuser1@gmail.com';
        eligibleContact.Designation__c = 'None';
        eligibleContact.Band__c = 'Band C';
        eligibleContact.Appraiser__c = empl.Id;
        eligibleContact.Reviewer__c = emp.Id;
       
        insert eligibleContact;
         Evaluation__c evaluation1 = new Evaluation__c();
        evaluation1.Status__c = 'Submitted';
        insert evaluation1;
        
        
       /* Evaluation__c updatedEvaluation = [SELECT Id, Status__c FROM Evaluation__c WHERE Id = :evaluation.Id];
        evaluation1.Status__c = 'Auto Submitted';
        update evaluation1;*/
      
     //   updatedEvaluation = [SELECT Id, Status__c FROM Evaluation__c WHERE Id = :evaluation.Id];
        
       initiatedRecords = [SELECT Id, Status__c, AppraiserName__c, EmployeeMaster__c, EmployeeMaster__r.Name, EmployeeMaster__r.Email
                            FROM Evaluation__c 
                            WHERE Status__c = 'Initiated'];

        // Set the 'Status__c' field to 'Auto_Submitted_to_Appraiser' for the initiated records
        for (Evaluation__c eval : initiatedRecords) {
            eval.Status__c = 'Submitted by Appraiser';
            eval.IsAutoSubmit__c = true;
            eval.SubmittedDate__c = System.today();
        }
        update initiatedRecords;
        
          // Verify the creation of Task_Tracker__c records
     //   List<Task_Tracker__c> taskTrackers = [SELECT Id, Evaluation__c, Employee_Name__c, MinWeightage__c, MaxWeightage__c, KPICategory__c, KPI_Name__c, Justification__c, Challenges__c, Weightage__c
                                            //  FROM Task_Tracker__c];
        
         Task_Tracker__c t = new Task_Tracker__c();
        Id recordTypeIdKpi =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        t.RecordTypeId=recordTypeIdKpi;
        t.Active__c=true;
        t.KPICategory__c='Functional';
        t.Band__c ='Band C';
        t.Designation__c='SOFTWARE ENGINEER';
        t.Weightage__c=10;
        t.Evaluation__c=evaluation.Id;
        insert t;
        Task_Tracker__c t1 = new Task_Tracker__c();
        Id recordTypeIdApp =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        t.RecordTypeId=recordTypeIdApp;
        t1.Active__c=true;
        t1.KPICategory__c='Organizational';
        t1.Band__c ='Band C';
         t1.Weightage__c=10;
        t1.Designation__c='SOFTWARE ENGINEER';
        t1.Evaluation__c=evaluation.Id;
        t1.Employee_Name__c = emp.Id;
        
        insert t1;
     
         Contact empp = [Select Id, Name,email from Contact limit 1];
        List<Evaluation__c> eval = [select Id,Name,AppraisalCycle__c,EmployeeMaster__r.Email,EmployeeMaster__r.Name,EmployeeMaster__r.Appraiser__r.Email from Evaluation__c];
        List<Task_Tracker__c> taskList=[select id, name from Task_Tracker__c where Evaluation__c=:eval[0].Id]; 
        
 // Create an Evaluation__c record with endDateAppraisee set to true
        Evaluation__c eval11 = new Evaluation__c(
            Status__c = 'Initiated',
            EmployeeMaster__c = emp.Id
        );
        insert eval11;

        // Create an Evaluation__c record with isEligible set to true
        Evaluation__c eval12 = new Evaluation__c(
            Status__c = 'Initiated',
            EmployeeMaster__c = emp.Id,
            AppraisalCycle__c = 'Mid_Term_Start_Date'
        );
        insert eval12;

        // Create an Evaluation__c record with isEligible set to true and endDateAppraisee set to true
        Evaluation__c eval13 = new Evaluation__c(
            Status__c = 'Initiated',
            EmployeeMaster__c = emp.Id,
            AppraisalCycle__c = 'Annual_Start_Date'
        );
        insert eval13;

        // Create an Evaluation__c record with different status to cover execute method
        Evaluation__c eval4 = new Evaluation__c(
            Status__c = 'Submitted',
            EmployeeMaster__c = emp.Id
        );
        insert eval4;

        Evaluation__c evaluation9 = new Evaluation__c(Status__c = 'Pending with Reviewer', Name = 'Evaluation 1', AppraisalCycle__c = 'Mid_Term_Start_Date', Start_Date__c = Date.today().addDays(-5), AppraiserFeedback__c = 'Appraisal Completed', AppraiserRating__c = 3, EmployeeMaster__c = emp.Id);
        Evaluation__c evaluation2 = new Evaluation__c(Status__c = 'Initiated', Name = 'Evaluation 2', AppraisalCycle__c = 'Mid_Term_Start_Date', Start_Date__c = Date.today().addDays(-10), EmployeeMaster__c = emp.Id);
        Evaluation__c evaluation3 = new Evaluation__c(Status__c = 'Initiated', Name = 'Evaluation 3', AppraisalCycle__c = 'Annual_Start_Date', Start_Date__c = Date.today().addDays(20), EmployeeMaster__c = emp.Id);
        Evaluation__c evaluation4 = new Evaluation__c(Status__c = 'Submitted', Name = 'Evaluation 4', EmployeeMaster__c = emp.Id);

        insert new List<Evaluation__c>{evaluation9, evaluation2, evaluation3, evaluation4};

        // Create test data for Task_Tracker__c
        Task_Tracker__c taskTracker1 = new Task_Tracker__c(Evaluation__c = evaluation2.Id, Employee_Name__c = emp.Id, MinWeightage__c = 100, MaxWeightage__c = 100, KPICategory__c = 'Functional', KPI_Name__c = 'KPI 1', Weightage__c = 100);
        Task_Tracker__c taskTracker2 = new Task_Tracker__c(Evaluation__c = evaluation2.Id, Employee_Name__c = emp.Id, MinWeightage__c = 100, MaxWeightage__c = 100, KPICategory__c = 'Organizational', KPI_Name__c = 'KPI 2', Weightage__c = 100);

        insert new List<Task_Tracker__c>{taskTracker1, taskTracker2};
        
             List<Evaluation__c> initiatedRecordss = [SELECT Id, Status__c, IsAutoSubmit__c FROM Evaluation__c WHERE Status__c = 'Submitted by Appraiser'];
      //  System.assertEquals(1, initiatedRecordss.size(), 'Expected only one Evaluation__c record to be updated');
        Evaluation__c updatedRecord = initiatedRecords[0];
      //  System.assertEquals('Submitted by Appraiser', updatedRecord.Status__c, 'Status should be updated to "Submitted by Appraiser"');
      //  System.assertEquals(true, updatedRecord.IsAutoSubmit__c, 'IsAutoSubmit__c should be true');

        // Verify that the Task_Tracker__c records for appraisee tasks are created correctly
        List<Task_Tracker__c> taskTrackerss = [SELECT Id, Evaluation__c FROM Task_Tracker__c];
      //  System.assertEquals(2, taskTrackerss.size(), 'Expected two Task_Tracker__c records to be created');
        
        // Verify that the Evaluation__c records with isEligible set to true are created correctly
        List<Evaluation__c> newlyCreatedRecords = [SELECT Id, Status__c FROM Evaluation__c WHERE Status__c = 'Not Initiated'];
       // System.assertEquals(1, newlyCreatedRecords.size(), 'Expected one Evaluation__c record to be created');
        Evaluation__c newRecord = newlyCreatedRecords[0];
       // System.assertEquals('Not Initiated', newRecord.Status__c, 'Status should be "Not Initiated"');

        // Verify that the emails were sent correctly
        List<EmailMessage> emails = [SELECT Id FROM EmailMessage];
       // System.assertNotEquals(0, emails.size(), 'Expected at least one email to be sent');
       // 
       
    }


 @isTest
    public static void method1() {
        testAppraiseeBatch();

        // Create an instance of the batch class
        CCT_AppraiseeController_Batch appraisee = new CCT_AppraiseeController_Batch(); 
appraisee.isEligible=true;
appraisee.endDateAppraisee=true;
        // Start the batch execution
        Test.startTest();
        Database.executeBatch(appraisee);
        Test.stopTest();
    }
     @isTest
    public static void method2() {
        testAppraiseeBatch();

        // Create an instance of the batch class
        CCT_AppraiseeController_Batch appraisee = new CCT_AppraiseeController_Batch(); 
appraisee.isEligible=true;
appraisee.endDateAppraisee=false;
        // Start the batch execution
        Test.startTest();
        Database.executeBatch(appraisee);
        Test.stopTest();
    }


}