@isTest
public class CCT_PmsPersonalDetailsController_Test {
    
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

        Contact emp=new Contact();
        emp.AccountId=acc.Id;
        emp.Salutation='Mr.';
        emp.FirstName='Vignesh';
        emp.LastName='Shrinivas';
        emp.RecordTypeId=recordTypeIdCandidate;
        emp.Active__c=true;
        emp.Employee_Joining_Date__c=date.today().addMonths(-10);
        emp.Role__c='HR';
        emp.EmployeeNo__c='CT-0123';
        emp.Employee_State__c='Andhra Pradesh';
        emp.Aadhar_Number__c='145623209834';
        emp.Account_Number__c='123556889987';
        emp.Employee_Id__c='CT-8745';
        emp.IFSC_Code__c='SBIN0123456';
        emp.MobilePhone='9614123124';
        emp.Phone='9614123124';
        emp.PAN_Number__c='MJAPS1145J';
        emp.PU_DU__c=du1.id;
        emp.Email='gouthamboini@gmail.com';
        emp.Designation__c = 'None';
        emp.Band__c = 'Band C';
       
        insert emp;
        
        Contact emp1=new Contact();
        emp1.AccountId=acc.Id;
        emp1.Salutation='Mr.';
        emp1.FirstName='Vignesh';
        emp1.LastName='Shrinivas';
        emp1.Active__c=true;
        emp1.Employee_Joining_Date__c=date.today().addMonths(-10);
        emp1.Role__c='Employee';
        emp1.EmployeeNo__c='emp124';
        emp1.Employee_State__c='Andhra Pradesh';
        emp1.Aadhar_Number__c='145623209835';
        emp1.Account_Number__c='123456889985';
        emp1.Employee_Id__c='CT-8746';
        emp1.IFSC_Code__c='SBIN0123457';
        emp1.MobilePhone='9614123128';
        emp1.Phone='9614123125';
        emp1.PAN_Number__c='MJAPS1145K';
        emp1.PU_DU__c=du1.id;
        emp1.Email='gouthamboini1@gmail.com';
        emp1.Designation__c = 'None';
        emp1.Band__c = 'Band C';
        emp1.Appraiser__c= emp.Id;
        emp1.Reviewer__c = emp.Id;
        emp1.ReportsToId=emp.Id;
        insert emp1;
         Contact emp2=new Contact();
        emp2.AccountId=acc.Id;
        emp2.Salutation='Mr.';
        emp2.FirstName='Suresh';
        emp2.LastName='vasu';
        emp2.Active__c=true;
        emp2.Employee_Joining_Date__c=date.today().addMonths(-10);
        emp2.Role__c='Employee';
        emp2.EmployeeNo__c='emp215';
        emp2.Employee_State__c='Andhra Pradesh';
        emp2.Aadhar_Number__c='578311169433';
        emp2.Account_Number__c='123456989985';
        emp2.Employee_Id__c='CT-1258';
        emp2.IFSC_Code__c='SBIN0158689';
        emp2.MobilePhone='8341634343';
        emp2.Phone='8341634345';
        emp2.PAN_Number__c='EATPB7411M';
        emp2.PU_DU__c=du1.id;
        emp2.Email='goutham.b@cloudtaru.com';
        emp2.Designation__c = 'None';
        emp2.Band__c = 'Band C';
        emp2.Appraiser__c=emp1.Id;
        emp2.Reviewer__c = emp.Id;
         emp2.ReportsToId=emp1.Id;
        insert emp2;
        
        Id recordTypeId =Schema.SObjectType.Evaluation__c.getRecordTypeInfosByDeveloperName().get('Appraisal_Form').getRecordTypeId();
        
        Evaluation__c evaluation = new Evaluation__c();
        evaluation.Status__c = 'Initiated';
        evaluation.Name = 'Madhav Appraisal';
        evaluation.RecordTypeId=recordTypeId;
        evaluation.AppraiserRating__c = 3;
        evaluation.AppraisalCycle__c ='Annual Cycle';
        evaluation.EmployeeMaster__c = emp1.Id;
        
        insert evaluation;  
        
        Evaluation__c evaluation1 = new Evaluation__c();
        evaluation1.Status__c = 'Initiated';
        evaluation1.RecordTypeId=recordTypeId;
        evaluation1.Name = 'Goutham';
        evaluation1.AppraiserRating__c = 3;
        evaluation1.AppraisalCycle__c ='Mid Term Cycle';
        evaluation1.EmployeeMaster__c = emp1.Id;
        insert evaluation1; 
        
        
        
        Evaluation__c evaluation2 = new Evaluation__c();
        evaluation2.Status__c = 'Initiated';
        evaluation2.Name = 'Madhav Appraisal2';
        evaluation2.AppraiserRating__c = 3;
        evaluation2.AppraisalCycle__c ='Mid Term Cycle';
        evaluation2.EmployeeMaster__c = emp1.Id;
        evaluation2.RecordTypeId=recordTypeId;
        insert evaluation2; 
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
        t1.Evaluation__c=evaluation2.Id;
        t1.Employee_Name__c = emp.Id;
        
        insert t1;
    }
    
    @isTest
    public static void getEmployeeRecordsTest(){
        Contact emp = [Select Id, Name,email from Contact limit 1];
        
        CCT_PmsPersonalDetailsController.getEmployeeinformaation(emp.email);
        CCT_PmsPersonalDetailsController.getApraiseeRecords(emp.Id);
        CCT_PmsPersonalDetailsController.checkStatus(emp.Id);
    }
    @isTest
    public static void getTaskRecordsTest(){
        
        Contact emp = [Select Id, Name,email from Contact limit 1];
        List<Task_Tracker__c> evaluationData=[SELECT 
                                              Id, Name,Active__c,Average_Allocation_for_the_time_perdiod__c,Band__c,Challenges__c,Designation__c,Evaluation__c,
                                              Justification__c,MaxWeightage__c,KPICategory__c,KPI_Name__c,Mandatory__c,Measurement_Criteria_Description__c,MinWeightage__c,
                                              Rating__c,Task_Description__c,Weightage__c,Objectives_And_Key_Results__c
                                              FROM Task_Tracker__c];
        List<Evaluation__c> eval = [select Id,name from Evaluation__c limit 1];
        
        //CCT_PmsPersonalDetailsController.checkKpidata1('SOFTWARE ENGINEER');
        //CCT_PmsPersonalDetailsController.displayKpi('SOFTWARE ENGINEER');
        //string des,string band, string evlId, string userRole, string status 
        CCT_PmsPersonalDetailsController.displayKpi('SOFTWARE ENGINEER','Band C');
        CCT_PmsPersonalDetailsController.getKpiList(eval[0].Id,'Appraisee' , 'Initiated');
        CCT_PmsPersonalDetailsController.getEvaluationDataForCompare(eval[0].Id,'Band C', 'SOFTWARE ENGINEER');
          CCT_PmsPersonalDetailsController.getTaskListForCompare(eval[0].Id,'Band C', 'SOFTWARE ENGINEER');
        CCT_PmsPersonalDetailsController.checkMandatoryKpis(eval[0].Id,'Band C', 'SOFTWARE ENGINEER');
        
        
    }
    @isTest
    public static void updateApraisalRecordTest(){
        
        Contact emp = [Select Id, Name,email from Contact limit 1];
        List<Evaluation__c> eval = [select Id,Name,AppraisalCycle__c,EmployeeMaster__r.Email,EmployeeMaster__r.Name,EmployeeMaster__r.Appraiser__r.Email from Evaluation__c];
        List<Task_Tracker__c> taskList=[select id, name from Task_Tracker__c where Evaluation__c=:eval[0].Id]; 
        CCT_PmsPersonalDetailsController.updateApraisalRecord(emp.Id, eval[0].Id);
        
        CCT_PmsPersonalDetailsController.insertApraiseeTasks(emp.Id, eval[0].Id,taskList);
        CCT_PmsPersonalDetailsController.compareList(eval[0].Id);
        CCT_PmsPersonalDetailsController.getTaskList(eval[0].Id);
        CCT_PmsPersonalDetailsController.getDeleteRec(taskList[0].Id);
        CCT_PmsPersonalDetailsController.calSumOfTask(eval[0].Id);
        CCT_PmsPersonalDetailsController.updateEvalRecord(eval[0].Id);
        CCT_PmsPersonalDetailsController.updateAppraisalFormStatus(eval[0].Id);

        
    }
    
    @isTest
    public static void testSaveKpi() {
        
        List<Evaluation__c> eval = [select Id,Name,AppraisalCycle__c from Evaluation__c];
        
        Task_Tracker__c taskList=[select id, name from Task_Tracker__c where Evaluation__c=:eval[0].Id];
        
        CCT_PmsPersonalDetailsController.saveKpi(taskList);
       
        
      
        //getAllAttachmentRecords
        //updateAppraisalFormClose
        //updateAppraisalFormGrivence
        //updateAppraisalFormStatus
        //updateRecordSent
        
    }
    @isTest
    public static void updateRecordSentTest() {
        Evaluation__c eval = [select Id,Name,AppraisalCycle__c,AppraiserRating__c from Evaluation__c limit 1];
         eval.AppraiserRating__c = 3;
       CCT_PmsPersonalDetailsController.updateRecordSent(eval); 
    }
     @isTest
    public static void insertAddhocRecordTest() {
                Task_Tracker__c t= new Task_Tracker__c();
               Id recordTypeIdKpi =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get('AppraiseeTasks').getRecordTypeId();
        t.RecordTypeId=recordTypeIdKpi;
        t.Active__c=true;
        CCT_PmsPersonalDetailsController.insertAddhocRecord(t);

      
    }

    
}