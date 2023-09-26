import { LightningElement, api, track } from 'lwc';
import getAllAppraiserRecords from '@salesforce/apex/CCT_AppraiserController.getAllAppraiserRecords';
import getAppraiserStatusRecordCounts from '@salesforce/apex/CCT_AppraiserController.getAppraiserStatusRecordCounts';
import getAppraiserRecord from '@salesforce/apex/CCT_AppraiserController.getAppraiserRecord';
import updateRecord from '@salesforce/apex/CCT_AppraiserController.updateRecord';
import updateAppraisalFormStatus from '@salesforce/apex/CCT_AppraiserController.updateAppraisalFormStatus';
import calculateSumOfTask from '@salesforce/apex/CCT_AppraiserController.calculateSumOfTask';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class lCT_teamsAppraisalForm extends LightningElement {
    @api recordId;
    @api employeeId;
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;
    @api savedKPIdata;
    @api selectedStatus;
    @api appraisalForm;

    data = [];
    record = {};
    statusData = [];
    filterData = [];
    @track home = true;
    @track viewAppraisal = false;
    @track editAppraisal = false;
    @track employeeName;
    @track appraisalName;
    @track appraiserFeedback;
    @track appraiserRating;
    @track conflictFlag;
    @track eligibilityForPromotion;
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
    @track status = false;
    savedKPIdata = [];
    showKPI = true;

    connectedCallback() {
        this.getAllAppraiserRecords();
        this.viewRowData(this.recordId);
        this.editAppraisal = true;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'view':
                this.viewRowData(row.Id);
                this.editAppraisal = true;
                this.home = false;
                break;
            default:
        }
    }

    viewRowData(recordId) {
        this.recordId = recordId;
        this.submitStatus = true;
        this.signedTemplate = false;
        this.editAppraisal = true;
        this.status = false;
        getAppraiserRecord({ recordId: this.recordId })
            .then(result => {
                if (result?.Status__c == 'Submitted' || result?.Status__c == 'Submitted by Appraiser' || result?.Status__c == 'Auto Submitted') {
                    this.submitStatus = false;
                    this.calligChild = true;
                }
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
                if (result?.Status__c == 'Submitted by Appraiser' || result?.Status__c == 'Pending with Reviewer'
                    || result?.Status__c == 'Final Rating Available' || result?.Status__c == 'Grievance Raised'
                    || result?.Status__c == 'Closed' || result?.Status__c == 'Initiated' || result?.Status__c == 'Not Initiated') {
                    this.signedTemplate = true;
                    this.status = true;
                }
                if(this.appraisalStatus == 'Initiated'){
                    this.showKPI = false;
                }
            })
            .catch(error => {
                console.log('getAppraiserRecord', error);
            })
    }

    getAllAppraiserRecords() {
        getAllAppraiserRecords({ employeeId: this.employeeId })
        .then(result => {
            this.data = result;
            this.filterData = this.data;
        })
        .catch(error => {
            console.log('Error getting getAllAppraiserRecords : ' ,error);
        })
    }

    getAppraiserStatusRecordCounts() {
        getAppraiserStatusRecordCounts({ employeeId: this.employeeId })
            .then(result => {
                this.statusData = result;
            })
            .catch(error => {
                console.log('Error getting getAppraiserStatusRecordCounts : ',error);
            })
    }

    badgeSuccess = 'slds-badge badge-success';
    handleStatusRowAction(event) {
        const statusVal = event.currentTarget.dataset.value;
        let value = '[data-value="' + statusVal + '"]';
        this.filterData = this.data.filter(record => record.Status__c == statusVal);
        let staBdgLst = this.template.querySelectorAll(('.dashStatBdg'));
        staBdgLst.forEach(element => {
            element.classList.remove('slds-badge_inverse');
        });
        if (statusVal == 'Initiated') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Not Initiated') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Sent For Review') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Submitted') {
            // this.signedButton=true;
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Signed By Appraiser') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Final Rating Available') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Grievance Raised') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Auto Submitted') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Closed') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        }
    }
    
    handleBack1() {
        this.viewAppraisal = false;
        this.editAppraisal = true;
        this.appraisalList = true;
        let backEvent = new CustomEvent('backevent');
        this.dispatchEvent(backEvent);
    }

    inputHandler(event) {
        if (event.target.name == 'overallRating') {
            this.overallRating = event.target.value;
        }
        if (event.target.name == 'overallComments') {
            this.overallComments = event.target.value;
        }
        if (event.target.name == 'justificationForEligibility') {
            this.justificationForEligibility = event.target.value;
        }
        if (event.target.name == 'whatHappenedWell') {
            this.whatHappenedWell = event.target.value;
        }
        if (event.target.name == 'whatCanBeDoneBetter') {
            this.whatCanBeDoneBetter = event.target.value;
        }
        if (event.target.name == 'prdDate') {
            this.prdDate = event.target.value;
        }
        if (event.target.name == 'prdTime') {
            this.prdTime = event.target.value;
        }
        if (event.target.name == 'prdWithAppraiserIsDone') {
            this.prdWithAppraiserIsDone = event.target.checked;
        }
        if (event.target.name == 'eligibilityForPromotion') {
            this.eligibilityForPromotion = event.target.checked;
        }
        if (event.target.name == 'appraiserComment') {
            this.appraiserComments = event.target.value;
        }
        if (event.target.name == 'ClosureComments') {
            this.appraiserComments = event.target.value;
        }
        if (event.target.name == 'GrievanceComment') {
            this.appraiserComments = event.target.value;
        }
    }
    
    handleSave() {
        let record = {
            "Id": this.recordId,
            "OverallRating__c": this.overallRating,
            "AppraiserComments__c": this.overallComments,
            "JustificationForEligibility__c": this.justificationForEligibility,
            "WhatHappenedWell__c": this.whatHappenedWell,
            "WhatCanBeDoneBetter__c": this.whatCanBeDoneBetter,
            "PRD_Date_And_Time_Appraiser__c": this.prdDate,
            "PRD_With_Appraisee_Is_Done__c": this.prdWithAppraiserIsDone,
            "EligibilityForPromotion__c": this.eligibilityForPromotion,
            "PRD_Duration_Appraiser__c": this.prdTime,
            "Appraiser_Comments__c": this.appraiserComments,
            "ClosureComments__c": this.ClosureComments,
            "GrievenceComment__c": this.GrievanceComment,
        };

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
                } else if (this.overallComments == '' || this.overallComments == undefined) {
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
                } else if (this.eligibilityForPromotion && (!this.justificationForEligibility || this.justificationForEligibility === '')) {
                    // else if (this.justificationForEligibility=='' || this.justificationForEligibility==undefined ) {
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: 'Please provide justification',
                        variant: 'error',
                        mode: 'pester'
                    });
                    this.dispatchEvent(event);
                }
                else {
                    console.log('----updateRecord---->', record);
                    updateRecord({ record: record })
                        .then(result => {
                            this.viewRowData(this.recordId);
                            this.overallRating = '';
                            this.overallComments = '';
                            this.justificationForEligibility = '';
                            this.whatHappenedWell = '';
                            this.whatCanBeDoneBetter = '';
                            this.prdDate = '';
                            this.prdTime = '';
                            this.prdWithAppraiserIsDone = false;
                            this.eligibilityForPromotion = false;
                        })
                        .catch(error => {
                            console.log(error);
                        })
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleSignedByAppraiser() {
        calculateSumOfTask({ evlId: this.recordId })
        .then(result => {
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
    // handleSignedByAppraiser() {
       
    //     updateAppraisalFormStatus({ appraisalId: this.recordId })
    //         .then(result => {
    //             this.viewRowData(this.recordId);
    //             const successMessage = 'Appraisal form status updated to Signed By Appraiser';
    //             const successEvent = new ShowToastEvent({
    //                 title: 'Success',
    //                 message: successMessage,
    //                 variant: 'success'
    //             });
    //             this.dispatchEvent(successEvent);

    //             // Refresh the appraisal form record
    //             return this.refreshAppraisalForm();
    //         })
    //         .catch(error => {
    //             console.log(error);
    //         });
    // }

    handleFinal() {
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