@isTest
public class CCT_AppraiseeController_SchedulerTest {
@isTest

   static void testExecute() {
        Test.startTest();
        CCT_AppraiseeController_Scheduler schedulable = new CCT_AppraiseeController_Scheduler();
        String sch = '0 0 11 * * ? 2023'; 
        String jobId = system.schedule('Test Appraisee Controller Schedulable', sch, schedulable);
        Test.stopTest();
        
     
        CronTrigger ct = [SELECT Id, CronExpression, TimesTriggered, NextFireTime
                          FROM CronTrigger WHERE Id = :jobId];
        }
}