/**
* @description 
*/
public without sharing class CCT_KPICustomMetadata {

    /**
    * @description getKPICustomMetadata
    * @param userRole string
    * @param status string
    * @return PMS_KPI_Fields__mdt
    **/
    @AuraEnabled(cacheable=true)
    public static List<PMS_KPI_Fields__mdt> getKPICustomMetadata(string userRole, string status)
    {
        List<PMS_KPI_Fields__mdt> kpiList = [Select Id, Label, FieldLabel__c, Sequence__c, FieldAPI__c, Editable__c, ObjectAPI__c, UserRole__c, Status__c,  Mandatory__c, Checkbox__c, Picklist__c, Text__c, Date__c, TextArea__c
        from PMS_KPI_Fields__mdt where UserRole__c=:userRole and Status__c=:status order by Sequence__c];
        return kpiList;
    }


    /**
    * @description getCategoryData
    * @param userRole string
    * @param status string
    * @param evaluationId Id
    * @return list<Task_Tracker__c>
    **/
    @AuraEnabled
    public static list<Task_Tracker__c> getKpiData(string userRole, string status, Id evaluationId)
    {
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

        list<Task_Tracker__c> queryResult;
        string condition = 'Where Evaluation__c=:evaluationId and recordtypeId=:recordTypeId';
        string sobj = 'Task_Tracker__c';
        string soqlQuery = 'Select ' +fieldList+ ' from ' +sobj+ ' ' +condition;
        queryResult = Database.query(soqlQuery);
        return queryResult;
    }
}