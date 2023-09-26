import { LightningElement,track,api,wire } from 'lwc';
import getEmployeeinformaation from '@salesforce/apex/CCT_PmsPersonalDetailsController.getEmployeeinformaation';

export default class LCT_empPersonalDetails extends LightningElement {
    @track activeSections = ['A','B','C','D','E','F','G','H','I','J'];
    @api employeeId;
    @api email;
    @api isAppraisee;
    @api isAppraiser;

    @track detailsdata=[]; 
    name;
    employeeId;
    appraiserName;
    delegatedAppraiserName;
   // MobilePhone;
    reportsToName;
    experienceInCloudtaru;
    //birthdate;
    reviewerName;
    delegatedReviewerName;
    email;
    employeeJoiningDate;
    designation;
    subband;
    band;
    employeeIdNo;
    @api employeeName;
    subBand;

    connectedCallback(){
        console.log('personal email :- '+this.email);
        console.log('personal email :- '+this.employeeId);
        console.log('personal email :- '+this.isAppraisee);
        console.log('personal name :- '+this.employeeName);
       
        this.getEmployeeData();

    }
    getEmployeeData(){
        console.log('personal email'+this.email);
        getEmployeeinformaation({ emailvalue: this.email })       
        .then((result) => {
            console.log(result);
           // console.log('result---'+JSON.stringify(result))
            //this.detailsdata.push(result);           
            //this.employeeId = result.Id;
            this.name = result?.Name;
            this.employeeIdNo = result?.Employee_Id__c;
            this.appraiserName = result?.Appraiser__r?.Name;
            this.delegatedAppraiserName =result?.DelegatedAppraiser__r?.Name;
           // this.MobilePhone = result?.MobilePhone;
            this.reportsToName = result?.ReportsTo?.Name;
            this.experienceInCloudtaru = result?.Experience_in_Cloudtaru__c;
           // this.birthdate = result?.Birthdate;
            this.designation = result?.Designation__c;
            this.reviewerName = result?.Reviewer__r?.Name;
            this.delegatedReviewerName = result?.DelegatedReviewer__r?.Name;
            this.email = result?.Email;
            this.employeeJoiningDate = result?.Employee_Joining_Date__c;
            this.band=result?.Band__c;
            this.subBand=result?.SubBand__c;
            if(this.employeeName==this.appraiserName){
                console.log('this.appHidden')
                this.appHidden=true;
                console.log(this.appHidden);
            }
           // this.subband=result?.Band__c;

            // this.article['Name']=result[0]?.contact?.Name?result[0]?.contact?.Name:'';
            // this.article['EmployeeID']=result[0]?.contact?.Employee_Id__c?result[0]?.contact?.Employee_Id__c:'';
            // this.article['Appraiser']=result[0]?.contact?.Appraiser__r.Name?result[0]?.contact?.Appraiser__r.Name:'';
            // this.article['Experience']=result[0]?.contact?.Experience_in_Cloudtaru__c?result[0]?.contact?.Experience_in_Cloudtaru__c:'';

           
           
        })
    }
}