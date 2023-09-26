public class CCT_PMS_EmailTemplateFramework {
    
    public static void sendCustomNotification(Map<Map<String, String>,List<string>> emailTemplateMap)//email (String), , TriggerName(String), feildVAluesMap(Map)
    {
        String emailTemplate;
        String emailSubject;
        String dynamicField;
        String templateBody;
        Id orgWideAddress;
        List<String> templatesNameList = new List<String>();
        List<String> dynamicFieldList = new List<String>();
        Map<String,CommunicationTrigger__mdt> commRecordMap = new Map<String,CommunicationTrigger__mdt>();
        Map<String,EmailTemplate> emailTempMap = new Map<String,EmailTemplate>();
        List<Messaging.SingleEmailMessage> sendEmailList = new List<Messaging.SingleEmailMessage>();
        
        for(Map<String,String> mapFields : emailTemplateMap.keySet()){
            templatesNameList.add(mapFields.get('TriggerName'));
        }
        
        for(CommunicationTrigger__mdt commTrigger : [Select TriggerName__c,Dynamicfields__c,EmailTemplateName__c,Description__c,TriggerType__c,Active__c FROM CommunicationTrigger__mdt WHERE EmailTemplateName__c IN: templatesNameList and Active__c='Yes']){
            commRecordMap.put(commTrigger.EmailTemplateName__c,commTrigger);
        }  
        
        for(EmailTemplate emailTemp : [Select DeveloperName,Name,Body,Subject,HtmlValue FROM EmailTemplate WHERE developerName IN: commRecordMap.keySet()]){
            emailTempMap.put(emailTemp.DeveloperName,emailTemp);
        }
        
        List<OrgWideEmailAddress> owa  = [SELECT Address, DisplayName, Id FROM OrgWideEmailAddress where DisplayName= 'HR CLOUDTARU' LIMIT 1];
        if(!owa.isEmpty())
        {
            orgWideAddress = owa[0].Id;   // From email : Orgwide Default Email Address
        }
        if(emailTemplateMap != null){   
            for(Map<String,String> dynamicVal : emailTemplateMap.keySet()){
                //List to hold dynamic values
                system.debug(emailTempMap.get(dynamicVal.get('TriggerName')));
                emailSubject = emailTempMap.get(dynamicVal.get('TriggerName')).Subject;
                dynamicField = commRecordMap.get(dynamicVal.get('TriggerName')).Dynamicfields__c;
                
                if(dynamicField.contains(',')) {
                    dynamicFieldList = dynamicField.split(',');    
                } 
                else {
                    dynamicFieldList.add(dynamicField);
                }
                templateBody = emailTempMap.get(dynamicVal.get('TriggerName')).HtmlValue;
                for(String dynamicValue : dynamicFieldList)
                {
                    System.debug(LoggingLevel.DEBUG,dynamicValue);
                    String key = '{!' + dynamicValue + '}';
                    System.debug(LoggingLevel.DEBUG,templateBody);
                    while (templateBody.containsIgnoreCase(key)) 
                    {
                        Integer foundPosition = templateBody.indexOfIgnoreCase(key, 0);
                        templateBody = templateBody.left(foundPosition) +(dynamicVal.get(dynamicValue)==NULL?'':dynamicVal.get(dynamicValue)) + templateBody.substring(foundPosition + key.length());
                    }
                    System.debug(LoggingLevel.DEBUG,templateBody);
                }
                System.debug(LoggingLevel.DEBUG,templateBody);
                emailTemplate = templateBody; 
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                email.setToAddresses(emailTemplateMap.get(dynamicVal));
                email.setOrgWideEmailAddressId(orgWideAddress);
                email.setSubject(emailSubject);
                email.setHtmlBody(emailTemplate);
                sendEmailList.add(email);     
            }
            System.debug(LoggingLevel.DEBUG,'sendEmailList ' + sendEmailList.size());
            if(!Test.isRunningTest()){
                Messaging.sendEmail(sendEmailList);
            }
            
        } 
    }	
}