import { LightningElement, api, track} from 'lwc';
import getAllAppraiserRecords from '@salesforce/apex/CCT_AppraiserController.getAllAppraiserRecords';
import getAppraiserStatusRecordCounts from '@salesforce/apex/CCT_AppraiserController.getAppraiserStatusRecordCounts';
import getAppraiserRecord from '@salesforce/apex/CCT_AppraiserController.getAppraiserRecord';
import updateRecord from '@salesforce/apex/CCT_AppraiserController.updateRecord';
import updateAppraisalFormStatus from '@salesforce/apex/CCT_AppraiserController.updateAppraisalFormStatus';
import calculateSumOfTask from '@salesforce/apex/CCT_AppraiserController.calculateSumOfTask';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const recordStatusCountColumns= [
    { label: 'Status', fieldName: 'Status__c', type : 'button',typeAttributes: {label: {fieldName: 'Status__c'}, name: 'statusName',variant: 'base'}, },
    { label: 'Count', fieldName: 'statusCount' },
];

const actions = [
   
    { label: 'view', name: 'view' },
];
const appraiserColumns = [
    
    { label: 'Name', fieldName: 'Name' },
    { label: 'Appraisal Cycle', fieldName: 'AppraisalCycle__c'},
    { label: 'Status', fieldName: 'Status__c' },
    { label: 'Submitted Date', fieldName: 'SubmittedDate__c' },
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


export default class Lct_appraisalForms extends LightningElement {
    @api employeeId;
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;
    data = [];
    columns = appraiserColumns;
    statusColumns = recordStatusCountColumns;
    record = {};
    statusData = [];
    filterData = [];

    @track home = true;
    @track viewAppraisal = false;
    @track editAppraisal = false;
    @track recordId;
    @track employeeName;
    @track appraisalName;
    @track appraiserFeedback;
    @track appraiserRating;
    @track conflictFlag;
    @track eligibilityForPromotion;
   // @track overallRating;
    @track prdWithAppraiserIsDone;
    @track reviewerRating;
    @track appraisalStatus;
    @track submittedDate;
    @track endDate;
    @track overallRating;
    @track overallComments;
    @track justificationForEligibility;
    @track whatHappenedWell;
    @track whatCanBeDoneBetter;
    @track prdDate;
    @track prdTime;
    @track prdWithAppraiserIsDone;
    @track eligibilityForPromotion;
    @track ratingforeachkpi;
    @track submitStatus = true;
    @track feedbackforeachkpi;
    @track appraiserWeightageforEachKpi;
    @track appraiserComments;
    @track ClosureComments;
    @track GrievanceComment;

    @track calligChild = false;
    @track signedTemplate = false;
    @api appraisalForm;
    @track status = false;
    currentStatus;
    sendToReviewer = false;
    @track showKPI = true;
    @track isClosed = false;
    @track isGrievanceRaised = false;


    
    connectedCallback() { 
        this.getAllAppraiserRecords();
        this.getAppraiserStatusRecordCounts();
          // Add logic to set isClosed and isGrievanceRaised based on the appraisalStatus
        //   if (this.appraisalStatus === 'Closed') {
        //     this.isClosed = true;
        //     this.isGrievanceRaised = false;
        // } else if (this.appraisalStatus === 'Grievance Raised') {
        //     this.isClosed = false;
        //     this.isGrievanceRaised = true;
        // } else {
        //     this.isClosed = false;
        //     this.isGrievanceRaised = false;
        // }
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
               
                this.editAppraisal = true;
                this.home = false;
                // setTimeout(() => {
                //     this.calligChild=true;
                //       }, 1000);
                break;
           
            default:
        }
    }
    viewRowData(recordId) {
        this.recordId = recordId;
        this.submitStatus = true; 
        this.signedTemplate = false;
        this.status = false;
        console.log( ' this.recordId'+this.recordId);
        getAppraiserRecord({ recordId: this.recordId })
            .then(result => {
              
                if( result?.Status__c == 'Submitted' || result?.Status__c == 'Submitted by Appraiser' || result?.Status__c == 'Auto Submitted') {
                    this.submitStatus = false;
                    this.calligChild = true;
                }
               
            
                console.log( 'result',result);
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
             
           // These status will not be availabe for Edit 

                if( result?.Status__c  ==  'Submitted by Appraiser'  || result?.Status__c == 'Pending with Reviewer'
                   || result?.Status__c == 'Final Rating Available'  || result?.Status__c == 'Grievance Raised'
                   || result?.Status__c == 'Closed'  || result?.Status__c == 'Initiated' || result?.Status__c == 'Not Initiated'){
                    this.signedTemplate = true;
                    this.status = true;
                }
                console.log('--this.showKPI-->',this.showKPI);
                console.log('--this.appraisalStatus-->',this.appraisalStatus);
                if(this.appraisalStatus == 'Initiated'){
                    this.showKPI = false;
                }
               
                
               // console.log(this.eligibilityForPromotion);
            })
            .catch(error => {
              //  console.log('getAppraiserRecord', JSON.stringify(error));
            })
    }

    getAllAppraiserRecords(){
        getAllAppraiserRecords({employeeId : this.employeeId} )
        .then(result => {
            this.data = result;
            this.filterData = this.data;
        })
        .catch(error => {
           // console.log('Error getting getAllAppraiserRecords : ' + JSON.stringify(error));
        })
    }

    getAppraiserStatusRecordCounts(){
        getAppraiserStatusRecordCounts({employeeId : this.employeeId})
        .then(result => {
            this.statusData = result;
           // console.log('statusData :- ');
           // console.log(this.statusData);
        })
        .catch(error => {
          //  console.log('Error getting getAppraiserStatusRecordCounts : ' + JSON.stringify(error));
        })
    }
    badgeSuccess = 'slds-badge badge-success';
    handleStatusRowAction(event) {
      //  console.log('line 76');
        const statusVal = event.currentTarget.dataset.value;
      //  console.log(statusVal);
        let value = '[data-value="'+statusVal+'"]';
        this.filterData = this.data.filter(record => record.Status__c == statusVal);
        let staBdgLst = this.template.querySelectorAll(('.dashStatBdg'));
        staBdgLst.forEach(element => {
            element.classList.remove('slds-badge_inverse');
        });
        if(statusVal == 'Initiated'){
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        }else if(statusVal == 'Not Initiated'){
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        }else if(statusVal == 'Sent For Review'){
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        }else if(statusVal == 'Submitted'){
            // this.signedButton=true;
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        }else if(statusVal == 'Signed By Appraiser'){
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        }else if(statusVal == 'Final Rating Available'){
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        }else if(statusVal == 'Grievance Raised'){
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        }     
    }
    handleBack(){
        this.editAppraisal = false;
        this.home = true;
    }
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
        if(event.target.name == 'appraiserComment'){
            this.appraiserComments = event.target.value;
        }
        if(event.target.name == 'ClosureComments'){
            this.ClosureComments = event.target.value;
        }
        if(event.target.name == 'GrievanceComment'){
            this.GrievanceComment = event.target.value;
        }
        
        
    }
    handleSave(){
     
        console.log('PRD Date and Time');
        console.log(this.prdDate);
        console.log(this.prdTime);
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
                           else if(!this.isInputValid('textAreaCss')){
                             if (this.overallComments=='' || this.overallComments==undefined ) {
                                const event = new ShowToastEvent({
                                    title: 'Error',
                                    message: 'Please provide Appraiser Comments',
                                    variant: 'error',
                                    mode: 'pester'
                                });
                                this.dispatchEvent(event);
                            }
                            else if (this.prdWithAppraiserIsDone && (!this.prdDate || !this.prdTime)) {
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
                            else if (this.eligibilityForPromotion && (!this.justificationForEligibility || this.justificationForEligibility === '')) {
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
                                console.log('----updateRecord---->',record);
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
                                this.prdWithAppraiserIsDone ='';
                                this.eligibilityForPromotion = '';
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
        calculateSumOfTask({ evlId: this.recordId })
        .then(result => {
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
       else if(!this.isInputValid('textAreaCss')){
        if (this.overallComments=='' || this.overallComments==undefined ) {
            const event = new ShowToastEvent({
                title: 'Error',
                message: 'Please provide Appraiser Comments',
                variant: 'error',
                mode: 'pester'
            });
            this.dispatchEvent(event);
        } 
    }else if(this.currentStatus == 'Auto Submitted' && this.overallRating >2){
        const event = new ShowToastEvent({
            title: 'Error',
            message: 'Overall rating should be less than 3 for Auto Submitted Appraisals',
            variant: 'error',
            mode: 'pester'
        });
        this.dispatchEvent(event);
    }
        else {
        // Call Apex method to update the status of the appraisal form to "Signed By Appraiser"
        updateAppraisalFormStatus({ appraisalId: this.recordId})
          .then(result => {

            this.viewRowData(this.recordId);

            //alert(JSON.stringify(result));
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
           // return this.refreshAppraisalForm();
          })
          .catch(error => {
            //alert(JSON.stringify(error));
            console.log('---handleSignedByAppraiser---> ');
            console.log(error);
           
         });
        }
    })
      }

    //   handleFinalValueUpdate(event) {
    //     alert('Final value update');
    //     this.viewRowData(this.recordId);
    // }
    // handleFinalValueUpdate(event) {
    //     console.log(recordId)
    //     alert('Final value update');
    //     if (event.detail.value.OverallRating__c !== this.overallRating) {
    //         this.overallRating = event.detail.value.OverallRating__c;
    //         this.viewRowData(this.recordId);
    //     }
    // }

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
    
}