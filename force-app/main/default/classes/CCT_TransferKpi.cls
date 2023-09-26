public class CCT_TransferKpi {
    /**
* @description Method to submitFeedbackRequest.
* @param selectedEmployeeId string
*/
    @AuraEnabled
    public static void submitTransferKpi(Id selectedEmployeeId, Id EmployeeId, Id kpiRecordId) {
        Id recordTypeId =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get(CCT_Kriya_Constants.AppraiseeTasks).getRecordTypeId();
        Task_Tracker__c newTransfer = new Task_Tracker__c();
        newTransfer.Employee_Name__c = EmployeeId;
        newTransfer.RecordTypeId = recordTypeId;
        newTransfer.KpiProvider__c = selectedEmployeeId;
        newTransfer.KpiStatus__c = 'KPI Transferred';
        newTransfer.Id = kpiRecordId;
        //   update newTransfer; 
        
        
        Database.Saveresult[]insertRecords =database.Update( new list<Task_Tracker__c>{newTransfer}, false);
        if (insertRecords[0].isSuccess()) 
        
        { 
            System.debug(insertRecords[0].Id);
            emailNotification(insertRecords[0].getId());
        }
    }
    public static void emailNotification(Id evaluationId) {
        Task_Tracker__c newTransfer = [SELECT Id, KpiStatus__c,KpiProvider__c,EmployeeMaster__c,KPI_Name__c,Employee_Name__r.Name,KpiProvider__r.email,KpiProvider__r.name
                                       FROM Task_Tracker__c
                                       WHERE Id = :evaluationId ];
        List<string> listEmail = new List<string>();
        Map<Map<String, String>,List<string>> emailTemplateMap = new Map<Map<String, String>,List<string>>();
        map<string,string> mergeFieldsData = new map<string,string>();
        mergeFieldsData.put('KeySet', newTransfer.Id);
        mergeFieldsData.put('RequestedAppraiser', newTransfer.Employee_Name__r.Name);
        mergeFieldsData.put('TargettedAppraiser',newTransfer.KpiProvider__r.name);
        mergeFieldsData.put('KpiName', newTransfer.KPI_Name__c);
        mergeFieldsData.put('TriggerName','KPI_Transfered');
        listEmail.add(newTransfer.KpiProvider__r.email);
        emailTemplateMap.put(mergeFieldsData,listEmail);
        //  system.debug('EmailTemplateMap'+emailTemplateMap);
      //  CCT_PMS_EmailTemplateFramework.sendCustomNotification(emailTemplateMap);
    }
    
    @AuraEnabled
    public static Task_Tracker__c getkpiStatusRecords(Id kpiRecordId){
     //   Evaluation__c evalRecord = [select id,EmployeeMaster__c from Evaluation__c where id =:evalRecordId]; 
     //   Id recordTypeId =Schema.SObjectType.Task_Tracker__c.getRecordTypeInfosByDeveloperName().get(CCT_Kriya_Constants.AppraiseeTasks).getRecordTypeId();
        Task_Tracker__c kpiStatus = [SELECT 
                                     Id, Name, KpiStatus__c
                                     FROM Task_Tracker__c where Id=:kpiRecordId ];
      
            return kpiStatus; 
        }
        
        //  return null;
        
    }