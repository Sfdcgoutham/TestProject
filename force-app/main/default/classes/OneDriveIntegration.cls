public without sharing class OneDriveIntegration {
      private static String grantType;
      private static String endPoint;
      private static String clientId;
      private static String clientSecret;
      private static String scope;
      private static String tenantId;
      private static String tokenURL;
      private static String accessToken;
    static One_Drive_Auth_Setting__mdt connDetails;
    
    public Class BaseException extends Exception{}

    public static One_Drive_Auth_Setting__mdt OneDriveSetting(){
        // return [select AuthGrantType__c, AuthEndpoint__c, ClientID__c, ClientSecret__c,Scope__c, TenantId__c,TokenUrl__c from One_Drive_Auth_Setting__mdt
        //        where Label = 'OneDriveAccess'];
        return [select AuthGrantType__c, AuthEndpoint__c, ClientID__c, ClientSecret__c,Scope__c, TenantId__c,TokenUrl__c from One_Drive_Auth_Setting__mdt
               where Label = 'PmsOneDriveAccess'];
    }
    
    /*public void UploadRecordDocuments(string recordId, String sObjectType)
    {
        accessToken = getAccessToken();
        if(string.isBlank(accessToken))
        {
            throw new BaseException('Issue in Authentication');
        }
        List<ContentDocumentLink> links=[SELECT ContentDocumentId,LinkedEntityId FROM ContentDocumentLink where LinkedEntityId=:recordId];
        Set<Id> ids=new Set<Id>();
        for(ContentDocumentLink link:links)
        {
            ids.add(link.ContentDocumentId);
        }
        List<ContentVersion> versions=[SELECT VersionData,Title,ContentDocumentId,FileExtension FROM ContentVersion WHERE ContentDocumentId IN :ids AND IsLatest = true];
        
        for(ContentVersion attach:versions)
        {
            try
            {
                String customEndPoint;
                system.debug(recordId);
                if(sObjectType==null || sObjectType == '')
                    customEndPoint = constructFilePath(endPoint,'Misc');
                else
                	customEndPoint = constructFilePath(endPoint,sObjectType);
                uploadFile(accessToken, attach.VersionData, attach.Title, attach.FileExtension, customEndPoint, recordId);
            }
            catch(Exception ex)
            {
                throw new BaseException(ex);
            }
        }
    }*/

    public void UploadDocument(string recordId, String sObjectType)
    {
        accessToken = getAccessToken();
        if(string.isBlank(accessToken))
        {
            throw new BaseException('Issue in Authentication');
        }
        List<ContentVersion> versions=[SELECT VersionData,Title,ContentDocumentId,FileExtension FROM ContentVersion WHERE ContentDocumentId = :recordId AND IsLatest = true];
        
        for(ContentVersion attach:versions)
        {
            try
            {
                String customEndPoint;
                if(sObjectType==null || sObjectType == '')
                    customEndPoint = constructFilePath(endPoint,'Misc');
                else
                	customEndPoint = constructFilePath(endPoint,sObjectType);
                System.debug(customEndPoint);
                uploadFile(accessToken, attach.VersionData, attach.Title, attach.FileExtension, customEndPoint, recordId);
            }
            catch(Exception ex)
            {
                throw new BaseException(ex);
            }
        }
    }

    
    public void uploadAttachment(string recordId, String sObjectType)
    {
        System.debug('Inside Upload Attachments Function');
        accessToken=getAccessToken();
        if(string.isBlank(accessToken))
        {
            throw new BaseException('Issue in Authentication');
        }
        
        List<Attachment> atts =[SELECT Name,Body,ContentType FROM Attachment WHERE Id=:recordId];
        System.debug(atts);
        for (Attachment att: atts){
            String saample ='Breakout Rooms.txt';
            List<String> FileNames = att.Name.Split('\\.');
            String FileExt = FileNames[FileNames.size()-1];
            FileNames.remove(FileNames.size()-1);
            String FileName = String.join(FileNames,'');
            try
            {
                System.debug(FileName);
                System.debug(FileExt);
                String customEndPoint;
                if(sObjectType==null || sObjectType == '')
                    customEndPoint = constructFilePath(endPoint,'Misc');
                else
                	customEndPoint = constructFilePath(endPoint,sObjectType);
                System.debug(customEndPoint);

                uploadFile(accessToken, att.Body, FileName, FileExt, customEndPoint, recordId);
            }
            catch(Exception ex)
            {
                throw new BaseException(ex);
            }
        }
    }
    @AuraEnabled
    public static void uploadFileContents(String fileContent, String fileName, String fileExt, String sObjectType, String recordId){
        system.debug(fileContent);
        system.debug(fileName);
        system.debug(fileExt);
        system.debug(sObjectType);
        system.debug(recordId);
        accessToken=getAccessToken();
        if(string.isBlank(accessToken))
        {
            throw new BaseException('Issue in Authentication');
        }
        
        try
        {
	            String customEndPoint;
                if(sObjectType==null || sObjectType == '')
                    customEndPoint = constructFilePath(endPoint,'Misc');
                else
                	customEndPoint = constructFilePath(endPoint,sObjectType);
                System.debug(customEndPoint);

            uploadFile(accessToken, EncodingUtil.base64Decode(fileContent), fileName, fileExt, customEndPoint, recordId);
        }
        catch(Exception ex)
        {
            throw new BaseException(ex);
        }
        
    }
    
    @Future(callout=true)
    public static void uploadFile(string accessToken,Blob versionData,string title,string extn, String endPoint, String recordId){
        //File Content
        system.debug('title: '+title);
 		system.debug(recordId);
        //String attachmentBody = EncodingUtil.base64Encode(versionData);
        String filename = title;
        string contentType=ContentType(extn);
        
        string endpointUrl= endPoint+'{file}:/content';
        string file=EncodingUtil.URLENCODE(filename,'UTF-8').replace('+', '%20');
        system.debug('file: '+file);
        endpointUrl=endpointUrl.replace('{file}',file+'.'+extn);
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpointUrl);
        req.setMethod('PUT'); 
        req.setHeader('Authorization','Bearer ' + accessToken);
        req.setHeader('Content-Encoding', 'UTF-8');
        req.setHeader('Content-type', contentType);
        req.setHeader('accept', 'application/json');
        Http http = new Http();
        //system.debug('getBody1 '+req);
        req.setBodyAsBlob(versionData);
        req.setTimeout(120000);
        
        HTTPResponse res = http.send(req);
        //system.debug('getBody2 '+res.getBody());
        //system.debug(res);
        
        if(res.getStatusCode()==201 || res.getStatusCode()==200  )
        {
            system.debug('getBody '+res.getBody());
            Map<String,Object> responseMap = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
            responseMap.put('filePath',endPoint);
            responseMap.put('recordId',recordId);
            responseMap.put('fileSize',versionData.size());
			saveFileDetails(responseMap);
        }
    }
    
    @AuraEnabled
    public static String getAccessToken(){
        String accessToken;
        
        connDetails = OneDriveIntegration.OneDriveSetting();
        grantType = connDetails.AuthGrantType__c;
        endPoint = connDetails.AuthEndpoint__c;
        clientId = EncodingUtil.urlEncode(connDetails.ClientID__c,'UTF-8');
        clientSecret = EncodingUtil.urlEncode(connDetails.ClientSecret__c,'UTF-8');
        scope = EncodingUtil.urlEncode(connDetails.Scope__c,'UTF-8');
        tenantId = connDetails.TenantId__c;
        tokenURL = connDetails.TokenUrl__c;
		
        HttpRequest req = new HttpRequest();
        req.setMethod('POST');
        req.setEndPoint(tokenURL);
        req.setHeader('content-type', 'application/x-www-form-urlencoded');
        
        String msgBody = 'client_id='+clientId+
            '&client_secret='+clientSecret+
            '&scope='+scope+
            '&grant_type='+grantType;
        
        req.setHeader('content-length',String.valueOf(msgBody.length()));
        req.setBody(msgBody);
        req.setTimeout(60*1000);
        
        Http callout = new Http();
        String responseText;
        HttpResponse response = callout.send(req);
        if(response.getStatusCode()==200){
            responseText = response.getBody();
            Map<String,Object> responseMap = (Map<String,Object>)JSON.deserializeUntyped(responseText);
            accessToken = String.valueOf(responseMap.get('access_token'));
            system.debug(accessToken);
        }
		return accessToken;
    }
    
    public static string ContentType(string fileType)
    {
        switch on fileType.toLowerCase()
        {
            when 'docx'
            {
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            }
            when 'csv'
            {
                return 'application/vnd.ms-excel';
            }
            when 'wav'
            {
                return 'audio/wav';
            }
            when 'wmv'
            {
                return 'video/x-ms-wmv';
            }
            when 'mp3'
            {
                return 'audio/mpeg';
            }
            when 'mp4'
            {
                return 'video/mp4';
            }
            when 'png'
            {
                return 'image/png';
            }
            when 'pdf'
            {
                return 'application/pdf';
            }
            when 'txt'
            {
                return 'text/plain';
            }
            when 'aac'{
				return 'audio/aac';
            }
            when 'avi'{
                return 'video/x-msvideo';
            }
            when 'bmp'{
                return 'image/bmp';
            }
            when 'doc'{
                return 'application/msword';
            }
            when 'gz'{
                return 'application/gzip';
            }
            when 'gif'{
                return 'image/gif';
            }
            when 'htm'{
                return 'text/html';
            }
            when 'html'{
                return 'text/html';
            }
            when 'ico'{
                return 'image/vnd.microsoft.icon';
            }
            when 'jpeg'{
                return 'image/jpeg';
            }
            when 'jpg'{
                return 'image/jpeg';
            }
            when 'mpeg'{
                return 'video/mpeg';
            }
            when 'odp'{
                return 'application/vnd.oasis.opendocument.presentation';
            }
            when 'ods'{
                return 'application/vnd.oasis.opendocument.spreadsheet';
            }
            when 'odt'{
                return 'application/vnd.oasis.opendocument.text';
            }
            when 'oga'{
                return 'audio/ogg';
            }
            when 'ogv'{
                return 'video/ogg';
            }
            when 'opus'{
                return 'audio/opus';
            }
            when 'ppt'{
                return 'application/vnd.ms-powerpoint';
            }
            when 'pptx'{
                return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            }
            when 'rar'{
                return 'application/vnd.rar';
            }
            when 'rtf'{
                return 'application/rtf';
            }
            when 'svg'{
                return 'image/svg+xml';
            }
            when 'swf'{
                return 'application/x-shockwave-flash';
            }
            when 'tar'{
                return 'application/x-tar';
            }
            when 'tif'{
                return 'image/tiff';
            }
            when 'tiff'{
                return 'image/tiff';
            }
            when 'ts'{
                return 'video/mp2t';
            }
            when 'vsd'{
                return 'application/vnd.visio';
            }
            when 'weba'{
                return 'audio/webm';
            }
            when 'webm'{
                return 'video/webm';
            }
            when 'webp'{
                return 'image/webp';
            }
            when 'xls'{
                return 'application/vnd.ms-excel';
            }
            when 'xlsx'{
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }
            when '7z'{
                return 'application/x-7z-compressed';
            }
        }
        return 'application/unknown';
    }

    public static void saveFileDetails(Map<String, Object> resMap){
        system.debug(resMap.get('recordId')+' parentid');
        Attchment__c custatt = new Attchment__c();
        custatt.File_Path__c = String.ValueOf(resMap.get('filePath'));
        custatt.Item_Id__c = String.valueOf(resMap.get('id'));
        custatt.Name = String.valueOf(resMap.get('name'));
        Map<String,Object> fileMap = (Map<String,Object>)resMap.get('file');
        custatt.File_Type__c = String.valueOf(fileMap.get('mimeType'));
        custatt.One_Drive_URL__c = String.valueOf(resMap.get('webUrl'));
        custatt.Parent_Id__c =  String.valueOf(resMap.get('recordId'));
        custatt.File_Size__c = Double.valueOf(resMap.get('fileSize'))/1024;
        
        //custatt.Parent_Type__c = String.valueOf(resMpa.get('PreantType'));
        if(custatt.Item_Id__c!= null && custatt.Item_Id__c!= ''){
            insert custatt;
        }
        
    }
    
    Public Blob downloadFile(String attachmentId){
        String accessToken = getAccessToken();
        Blob retVal;
        Attchment__c a = [select File_Path__c, Item_Id__c from Attchment__c where ID=:attachmentID];
        if(a.File_Path__c != null && a.File_Path__c != ''){
            String endpointUrl = a.File_Path__c.split('root:')[0];
            endpointUrl = endPointUrl+'items/'+a.Item_Id__c+'/content';
            System.debug(endpointUrl);
            Http callout = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endpointUrl);
            req.setMethod('GET'); 
            req.setHeader('Authorization','Bearer ' + accessToken);
            req.setHeader('accept', '*/*');
            req.setTimeout(120000);
            
            HttpResponse resp = callout.send(req);
            if(resp.getStatusCode()==302){
                string location = resp.getHeader('Location');
                System.debug(location);
                req.setEndpoint(location);
                resp = new Http().send(req);
                if(resp.getStatusCode()==200){
                	String responseStr = resp.getBody();
                	System.Debug(responseStr);
                	Blob fileData = Blob.valueOf(responseStr);
                	retVal= fileData;
            	}
            	retVal = Blob.valueOf('File can not be downloaded');
            }
            retVal = Blob.valueOf('File Can not be downloaded');
        }
        retVAl = Blob.valueOf('Record Id passed is invalid');
        return retVal;
    }
  
    @AuraEnabled
    Public static String getDownloadLink(String attachmentId){
        String accessToken = getAccessToken();
        Attchment__c a = [select File_Path__c, Item_Id__c from Attchment__c where ID=:attachmentID];
        string retVal;
        if(a.File_Path__c != null && a.File_Path__c != ''){
            String endpointUrl = a.File_Path__c.split('root:')[0];
            endpointUrl = endPointUrl+'items/'+a.Item_Id__c+'/content';
            System.debug(endpointUrl);
            Http callout = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endpointUrl);
            req.setMethod('GET'); 
            req.setHeader('Authorization','Bearer ' + accessToken);
            req.setHeader('accept', '*/*');
            req.setTimeout(120000);
            
            HttpResponse resp = callout.send(req);
            system.debug(resp);
            if(resp.getStatusCode()==302){
                string location = resp.getHeader('Location');
                return location;
            }
            return 'File Can not be downloaded. Interface returned Status:'+resp.getStatus();
        }
        return 'Record Id passed is invalid';
    }
    @AuraEnabled
    public static String deleteFile(String attachmentId){
        String retStr;
        String accessToken = getAccessToken();
        
        Attchment__c a = [select File_Path__c, Item_Id__c from Attchment__c where ID=:attachmentId];
        if(a.File_Path__c != null && a.File_Path__c != ''){
            String endpointUrl = a.File_Path__c.split('root:')[0];
            endpointUrl = endPointUrl+'items/'+a.Item_Id__c;
            System.debug(endpointUrl);
			Http callout = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endpointUrl);
            req.setMethod('DELETE'); 
            req.setHeader('Authorization','Bearer ' + accessToken);
            req.setHeader('accept', '*/*');
        
            HttpResponse resp = callout.send(req);
            if(resp.getStatusCode()==204){
                retStr = 'File Deleted';
                delete a;
            }
            else{
                retStr = resp.toString();
            }
        }
        else{
            retStr = 'No Attachment record found with given Id';
        }
        return retStr;
    }
    
    private static String constructFilePath(String endPoint, String sObjectType){
		System.debug('Inside Construct File Path Method');
        Datetime dt = Datetime.now();
        String customEndPoint = endPoint.substring(0,endPoint.length()-1) +':/children';
        System.debug(customEndPoint);
        System.debug(sObjectType);
        customEndPoint = checkAndCreateFolder(customEndPoint, sObjectType);
        System.debug(customEndPoint);
        //customEndPoint = customEndPoint.substring(0,customEndPoint.length()-1) +':/children';
        customEndPoint = checkAndCreateFolder(customEndPoint, dt.format('MMM')+dt.format('YY'));
        return customEndPoint.replace(':/children','/');
    }
    
    private static String checkAndCreateFolder(String endPoint, String folderName){
        System.debug('Inside Check and Create Folder Method');
        String retVal;
        accessToken = getAccessToken();
 
        System.debug(endPoint);
        System.debug(folderName);
        folderName = folderName.replace(' ','_');
        Http callout = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndPoint(endPoint);
        req.setMethod('POST');
        req.setBody('{"name":"'+folderName+'","folder":{},"@microsoft.graph.conflictBehavior":"fail"}');
        req.setHeader('Authorization','Bearer ' + accessToken);    
		req.setHeader('content-type','application/json');
        req.setHeader('accept', '*/*');
        
        HttpResponse resp = callout.send(req);
        system.debug('Response');
        system.debug(resp);
        if(resp.getStatusCode()==409 || resp.getStatusCode()==201)
            retVal = endPoint.replace(':/children', '/'+folderName+':/children');
        else
            retVal = 'Can not check if the folder is existing'; 
            
        System.debug(retVal);
        return retVal;
    }

    @AuraEnabled
    public static void uploadFileContentsForPMS(String fileContent, String fileName, String fileExt, String folderName1, String folderName2, String recordId){
        system.debug('Inside uploadFileContentsForPMS');
        system.debug(fileContent);
        system.debug(fileName);
        system.debug(fileExt);
        system.debug(folderName1);
        system.debug(folderName2);
        system.debug(recordId);
        accessToken=getAccessToken();
        Datetime dt = Datetime.now();
        String appraisalCycle = folderName1+'_'+dt.format('YYYY');
        
        // Remove single quotes from the string
        String evaluationName = folderName2.replace('\'', '');

        if(string.isBlank(accessToken))
        {
            throw new BaseException('Issue in Authentication');
        }
        
        try
        {
	            String customEndPoint;
                if(appraisalCycle==null || appraisalCycle == '')
                    customEndPoint = constructFilePathForPMS(endPoint,'Misc','');
                else
                	customEndPoint = constructFilePathForPMS(endPoint,appraisalCycle, evaluationName);
                System.debug(customEndPoint);

            uploadFile(accessToken, EncodingUtil.base64Decode(fileContent), fileName, fileExt, customEndPoint, recordId);
        }
        catch(Exception ex)
        {
            throw new BaseException(ex);
        }
    }

    //Construct new file path for PMS application
    private static String constructFilePathForPMS(String endPoint, String folderName1, String folderName2){
		System.debug('Inside Construct File Path For PMS Method');
        Datetime dt = Datetime.now();
        String customEndPoint = endPoint.substring(0,endPoint.length()-1) +':/children';
        System.debug(customEndPoint);
        System.debug(folderName1);
        System.debug(folderName2);
        customEndPoint = checkAndCreateFolder(customEndPoint, folderName1);
        System.debug(customEndPoint);
        //customEndPoint = customEndPoint.substring(0,customEndPoint.length()-1) +':/children';
        customEndPoint = checkAndCreateFolder(customEndPoint, folderName2);
        return customEndPoint.replace(':/children','/');
    }
}