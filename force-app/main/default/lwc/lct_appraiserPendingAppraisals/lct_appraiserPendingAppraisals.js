import { LightningElement, api, track} from 'lwc';
import getAppraiserRecords from '@salesforce/apex/CCT_AppraiserController.getAppraiserRecords';
import getAppraiserRecord from '@salesforce/apex/CCT_AppraiserController.getAppraiserRecord';
import getAppraiserEndDate from '@salesforce/apex/CCT_AppraiserController.getAppraiserEndDate';
import updateAppraisalFormStatus from '@salesforce/apex/CCT_AppraiserController.updateAppraisalFormStatus';
import updateRecord from '@salesforce/apex/CCT_AppraiserController.updateRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import calculateSumOfTask from '@salesforce/apex/CCT_AppraiserController.calculateSumOfTask';
import getTransferedTaskList from '@salesforce/apex/CCT_PmsPersonalDetailsController.getTransferedTaskList';

// const recordStatusCountColumns= [
//     { label: 'Status', fieldName: 'Status__c', type : 'button',typeAttributes: {label: {fieldName: 'Status__c'}, name: 'statusName',variant: 'base'}, },
//     { label: 'Count', fieldName: 'statusCount' },
// ];
const actions = [
    { label: 'View', name: 'view' },
    // { label: 'Edit', name: 'edit' },
];

const columns = [
    { label: 'Name', fieldName: 'Name'},
    { label: 'Appraisal Cycle', fieldName: 'AppraisalCycle__c'},
    { label: 'Status', fieldName: 'Status__c' },
    { label: 'Submitted Date', fieldName: 'SubmittedDate__c' },
    // { label: 'Appraiser', fieldName: 'AppraiserName__c' },
   // { label: 'Feedback', fieldName: 'AppraiserFeedback__c' },
    {
        label: 'Actions',
            type: 'button-icon',
            fixedWidth: 80,        
            typeAttributes:
            {
                iconName: 'utility:preview',
                name: 'view',
                iconClass: 'slds-icon-text-default slds-icon_xx-small'
            }
    },
];
const columns1 = [
    { label: 'Name', fieldName: 'Name'},
    { label: 'Employee Name', fieldName: 'EmployeeMaster__c'},
    { label: 'Status', fieldName: 'KpiStatus__c' },
    // { label: 'Appraiser', fieldName: 'AppraiserName__c' },
   // { label: 'Feedback', fieldName: 'AppraiserFeedback__c' },
    {
        label: 'Actions',
            type: 'button-icon',
            fixedWidth: 80,        
            typeAttributes:
            {
                iconName: 'utility:preview',
                name: 'view',
                iconClass: 'slds-icon-text-default slds-icon_xx-small'
            }
    },
];

export default class Lct_appraiserPendingAppraisals extends LightningElement {
     
    @api employeeId;
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;
    data = [];
    transferedKPIs=[];
    columns = columns;
    columns1=columns1;
    record = {};
    home = true;
    viewAppraisal = false;
    viewTransferKpi=false;
    editAppraisal = false;
    employeeName;
    appraisalName;
    appraiserFeedback;
    appraiserRating;
    conflictFlag;
    eligibilityForPromotion;
    overallRating;
    prdWithAppraiserIsDone;
    reviewerRating;
    @track appraisalStatus;
    submittedDate;
    endDate;
    evlRecordId;
    //statusColumns = recordStatusCountColumns;

    @track overallRating;
    @track overallComments;
    @track justificationForEligibility;
    @track whatHappenedWell;
    @track whatCanBeDoneBetter;
    @track prdDate;
    @track prdTime;
    @track prdWithAppraiserIsDone;
    @track eligibilityForPromotion;
    @track signedTemplate = false;
    @track submitStatus = true;
    @track status = false;
    @track ClosureComments;
    @track GrievanceComment;
    currentStatus;
    sendToReviewer = false;
    tranferKpiId;
    @track activeSections = ['A','B','C','D','E','F','G','H','I','J'];

    // @track ratingforeachkpi;
    // @track feedbackforeachkpi;
    // @track appraiserWeightageforEachKpi;
    @track calligChild;    
    get ratingOptions() {
        return [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
        ];
    } 
    connectedCallback() {
        this.getAppraiserRecords();
        this.getAppraiserEndDate();
        this.getTransferedRecords();
      //  this.getAppraiserStatusRecordCounts();
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        this.currentStatus = row.Status__c;
        console.log('---currentStatus--->',this.currentStatus);
        if(this.currentStatus == 'Auto Submitted'){
            this.sendToReviewer = true;
        }
        switch (actionName) {
            case 'view':
                this.viewRowData(row.Id);
                this.viewAppraisal = true;
                this.editAppraisal = false;
                this.home = false;
                setTimeout(() => {
                this.calligChild=true;
                  }, 1000);
                break;
            case 'edit':
                this.viewRowData(row.Id);
                this.viewAppraisal = false;
                this.editAppraisal = true;
                this.home = false;
                this.calligChild=false;
                break;
            default:
        }
    }

    viewRowData(recordId) {
        this.recordId = recordId;
        this.submitStatus = true;
        this.signedTemplate = false;
        this.status = false;
        getAppraiserRecord({ recordId: this.recordId })
            .then(result => {
                if( result?.Status__c == 'Submitted' || result?.Status__c == 'Submitted by Appraiser' || result?.Status__c == 'Auto Submitted') {
                    this.submitStatus = false;
                    this.calligChild = true;
                }
                
                // console.log('View Record Datasss');
                // console.log(result);
                // console.log(result.EmployeeMaster__r.Name);
                this.employeeName = result?.EmployeeMaster__r.Name;
                this.appraisalName = result?.Name;
                this.appraiserFeedback = result?.AppraiserFeedback__c;
                this.appraiserRating = result?.AppraiserRating__c;
                this.conflictFlag = result?.ConflictFlag__c;
                this.eligibilityForPromotion = result?.EligibilityForPromotion__c;
                this.overallRating = result?.OverallRating__c;
                this.overallComments = result?.AppraiserComments__c;
                this.prdWithAppraiserIsDone = result?.PRD_With_Appraisee_Is_Done__c;
                this.reviewerRating = result?.ReviewerRating__c;
                this.appraisalStatus = result?.Status__c;
                this.submittedDate = result?.SubmittedDate__c;
                this.justificationForEligibility = result?.JustificationForEligibility__c;
                this.whatHappenedWell = result?.WhatHappenedWell__c;
                this.whatCanBeDoneBetter = result?.WhatCanBeDoneBetter__c;
                this.prdDate = result?.PRD_Date_And_Time_Appraiser__c;
                this.EligibilityForPromotion__c = result?.EligibilityForPromotion__c;
                this.prdTime = result?.PRD_Duration_Appraiser__c;
                this.ClosureComments = result?.ClosureComments__c;
                this.GrievanceComment = result?.GrievenceComment__c;

                if( this.appraisalStatus ==  'Submitted by Appraiser' ){
                    this.signedTemplate = true;
                    this.status = true;
                }
                console.log(this.eligibilityForPromotion);
            })
            .catch(error => {
                console.log('getAppraiserRecord', JSON.stringify(error));
            })
    }

    handleBack() {
        this.home = true;
        this.viewAppraisal = false;
        this.editAppraisal = false;
    }

    getAppraiserRecords(){
        getAppraiserRecords({employeeId : this.employeeId} )
        .then(result => {
            console.log(result);
            this.data = result;
        })
        .catch(error => {console.log(error);
            console.log('Error getting getAppraiserRecords : ' + JSON.stringify(error));
        })
    }

    getAppraiserEndDate(){
        getAppraiserEndDate()
        .then(result => {
            console.log('getAppraiserEndDate:- ')
            console.log(result);
            this.endDate = result.End_Date__c;
        })
        .catch(error => {
            console.log('Error getting getAppraiserEndDate : ' + JSON.stringify(error));
        })
    }
    // getAppraiserStatusRecordCounts(){
    //     getAppraiserStatusRecordCounts({employeeId : this.employeeId})
    //     .then(result => {
    //         this.statusData = result;
          
    //     })
    //     .catch(error => {
          
    //     })
    // }
   
    inputHandler(event){
        if(event.target.name == 'overallRating'){
            this.overallRating = event.target.value;
        }
        if(event.target.name == 'overallComments'){
            this.overallComments = event.target.value;
        }
        if(event.target.name == 'justificationForEligibility'){
            this.justificationForEligibility = event.target.value;
        }
        if(event.target.name == 'whatHappenedWell'){
            this.whatHappenedWell = event.target.value;
        }
        if(event.target.name == 'whatCanBeDoneBetter'){
            this.whatCanBeDoneBetter = event.target.value;
        }
        if(event.target.name == 'prdDate'){
            this.prdDate = event.target.value;
        }
        if(event.target.name == 'prdTime'){
            this.prdTime = event.target.value;
        }
        if(event.target.name == 'prdWithAppraiserIsDone'){
            this.prdWithAppraiserIsDone = event.target.checked;
        }
        if(event.target.name == 'eligibilityForPromotion'){
            this.eligibilityForPromotion = event.target.checked;
        }
        if(event.target.name == 'ClosureComments'){
            this.ClosureComments = event.target.value;
        }
        if(event.target.name == 'GrievanceComment'){
            this.GrievanceComment = event.target.value;
        }
      
        
    }
    handleSave(){
        let record ={   
            "Id":this.recordId,
            "OverallRating__c":this.overallRating,
            "AppraiserComments__c":this.overallComments,
            "JustificationForEligibility__c":this.justificationForEligibility,
            "WhatHappenedWell__c":this.whatHappenedWell,
            "WhatCanBeDoneBetter__c":this.whatCanBeDoneBetter,
            "PRD_Date_And_Time_Appraiser__c":this.prdDate,
            "PRD_With_Appraisee_Is_Done__c":this.prdWithAppraiserIsDone,
            "EligibilityForPromotion__c":this.eligibilityForPromotion,
            "PRD_Duration_Appraiser__c":this.prdTime,
            "Appraiser_Comments__c":this.appraiserComments,
            "ClosureComments__c":this.ClosureComments,
            "GrievenceComment__c":this.GrievanceComment,
           
        };
        
console.log(record)    


console.log('handleKpiSubmit');
calculateSumOfTask({ evlId: this.recordId })
            .then(result => {
                console.log('calculation');
                console.log(result);
                if (result !== 100) {
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: 'The sum of weightages across all tasks should be 100',
                        variant: 'error',
                        mode: 'pester'
                    });
                    this.dispatchEvent(event);

                }
                if(!this.isInputValid('textAreaCss'))
                {
                     if (this.overallComments=='' || this.overallComments==undefined ) {
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: 'Please provide Appraiser Comments',
                        variant: 'error',
                        mode: 'pester'
                    });
                    this.dispatchEvent(event);
                } if (this.prdWithAppraiserIsDone && (!this.prdDate || !this.prdTime)) {
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: 'Please provide Date and Time',
                        variant: 'error',
                        mode: 'pester'
                    });
                    this.dispatchEvent(event);
                }
                // else if (this.prdTime=='' || this.prdTime==undefined ) {
                //     const event = new ShowToastEvent({
                //         title: 'Error',
                //         message: 'Please provide Time',
                //         variant: 'error',
                //         mode: 'pester'
                //     });
                //     this.dispatchEvent(event);
                // }
                 if (this.eligibilityForPromotion && (!this.justificationForEligibility || this.justificationForEligibility === '')) {
               // else if (this.justificationForEligibility=='' || this.justificationForEligibility==undefined ) {
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: 'Please provide Justification For Eligibility',
                        variant: 'error',
                        mode: 'pester'
                    });
                    this.dispatchEvent(event);
                }
            }
                
                else{
                   updateRecord({record :record})
                   .then(result=>{

                    this.viewRowData(this.recordId);


                
                    this.overallRating = '';
                    this.overallComments = '';
                    this.justificationForEligibility = '';
                    this.whatHappenedWell = '';
                    this.whatCanBeDoneBetter = '';
                    this.prdDate = '';
                    this.prdTime = '';
                    this.prdWithAppraiserIsDone =false;
                    this.eligibilityForPromotion = false;
                // this.appraiserComments = '';
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'The Appraisal Form is Saved Successfully',
                    variant: 'Success',
                    mode: 'pester'
                }),);
                                        
                })
                .catch(error=>{

                })

                }
            })
            .catch(error => {
                console.error(error);
                // Handle error if needed
            });

        }

    handleSignedByAppraiser() {
        console.log('this.currentStatus--> ',this.currentStatus);
            console.log('this.overallRating--> ',this.overallRating);
            if(!this.isInputValid('textAreaCss')){
        if (this.overallComments=='' || this.overallComments==undefined ) {
            const event = new ShowToastEvent({
                title: 'Error',
                message: 'Please provide Appraiser Comments',
                variant: 'error',
                mode: 'pester'
            });
            this.dispatchEvent(event);
        } 
     }
     else if(this.currentStatus == 'Auto Submitted' && this.overallRating >2){            
        const event = new ShowToastEvent({
            title: 'Error',
            message: 'Overall rating should be less than 3 for Auto Submitted Appraisals',
            variant: 'error',
            mode: 'pester'
        });
        this.dispatchEvent(event);
    } else {
        // Call Apex method to update the status of the appraisal form to "Signed By Appraiser"
        updateAppraisalFormStatus({ appraisalId: this.recordId})
          .then(result => {
            this.viewRowData(this.recordId);
            const successMessage = 'Appraisal form status updated to Signed By Appraiser';
            const successMessageReviewer = 'Appraisal form status updated to Pending with Reviewer';
            if(this.currentStatus=='Submitted'){
                const successEvent = new ShowToastEvent({
                    title:'Success',
                    message:successMessage,
                    variant:'success'
                 });
                 this.dispatchEvent(successEvent);
            } else if(this.currentStatus=='Auto Submitted'){
                const successEvent = new ShowToastEvent({
                    title:'Success',
                    message:successMessageReviewer,
                    variant:'success'
                 });
                 this.dispatchEvent(successEvent);
            }
    
            // Refresh the appraisal form record
            return this.refreshAppraisalForm();
          })
          .catch(error => {
          
         });
        }
      }

      handleFinal(){
        //alert('handleFinal');
        this.viewRowData(this.recordId);
    }
    isInputValid(res) {
        let name = '.'+res;
         let isValid = true;
         let inputFields = this.template.querySelectorAll(name);
         inputFields.forEach(inputField => {
             if(!inputField.checkValidity()) {
                 inputField.reportValidity();
                 isValid = false;
             }
         });
         return isValid;
      }
      getTransferedRecords(){ 
        getTransferedTaskList({employeeId : this.employeeId} )
        .then(result => {
            console.log(result);
            this.transferedKPIs = result;
        })
        .catch(error => {console.log(error);
            console.log('Error getting getAppraiserRecords : ' + JSON.stringify(error));
        })
       }
       handleRowActionKpi(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        console.log(JSON.parse(JSON.stringify(row)));
        console.log('---Evaluation--->',row.Evaluation__c);
        this.evlRecordId=row.Evaluation__c;
        
        switch (actionName) {
            case 'view':
                //this.viewRowData(row.Id);
                this.tranferKpiId=row.Id;
                this.evlRecordId=row.Evaluation__c;
                console.log('tranferKpiId'+ this.tranferKpiId);
                this.viewTransferKpi = true;
                this.home = false;
                break;
        }
    }

}