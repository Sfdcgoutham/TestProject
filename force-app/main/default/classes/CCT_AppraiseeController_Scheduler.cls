/***
    @author Sneha
    @description Schedule Apex 
	@date 11/04/2023
	**/
 public class CCT_AppraiseeController_Scheduler implements Schedulable{
     /***
    @author Sneha
    @description Schedule Apex 
	@date 11/04/2023
	**/
	public void execute(SchedulableContext schedule) {
        CCT_AppraiseeController_Batch appraisee = new CCT_AppraiseeController_Batch(); 
    	Database.executeBatch(appraisee,2000);
    }
}