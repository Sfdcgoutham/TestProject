import { LightningElement, api, track } from 'lwc';
import getAllAppraisalRecords from '@salesforce/apex/CCT_PMSReviewer.getAllAppraisalRecords';
import getAppraisalStatusRecordCounts from '@salesforce/apex/CCT_PMSReviewer.getAppraisalStatusRecordCounts';
import getIndividualAppraisalRecord from '@salesforce/apex/CCT_PMSReviewer.getIndividualAppraisalRecord';
import getReviewerRecords from '@salesforce/apex/CCT_PMSReviewer.getReviewerRecords';
import updateAppraisal from '@salesforce/apex/CCT_PMSReviewer.updateAppraisal';
import finalizeAppraisal from '@salesforce/apex/CCT_PMSReviewer.finalizeAppraisal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import calculateSumOfTask from '@salesforce/apex/CCT_AppraiserController.calculateSumOfTask';

const recordStatusCountColumns = [
    { label: 'Status', fieldName: 'Status__c', type: 'button', typeAttributes: { label: { fieldName: 'Status__c' }, name: 'statusName', variant: 'base' }, },
    { label: 'Count', fieldName: 'statusCount' },
];

const actions = [
    { label: 'View', name: 'view' },
    // { label: 'Edit', name: 'edit' },
];

const appraiserColumns = [
    //{ label: 'Name', fieldName: 'Name', type : 'button',typeAttributes: {label: {fieldName: 'Name'}, name: 'REQNnum',variant: 'base'},},
    { label: 'Name', fieldName: 'Name' },
    { label: 'Status', fieldName: 'Status__c' },
    { label: 'Appraisal Cycle', fieldName: 'AppraisalCycle__c' },
    { label: 'Submitted Date', fieldName: 'SubmittedDate__c' },
    { label: 'Appraiser', fieldName: 'AppraiserName__c' },
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

export default class LctAllAppraisalForms extends LightningElement {
    @api employeeId;
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;
    @track data = [];
    columns = appraiserColumns;
    statusColumns = recordStatusCountColumns;
    record = {};
    @track statusData = [];
    @track filterData = [];
    home = true;
    viewAppraisal = false;
    editAppraisal = false;
    employeeName;
    appraisalName;
    appraiserFeedback;
    appraiserRating;
    conflictFlag;
    eligibilityForPromotion;
    @track overallRating;
    @track overallComments;
    @track eligibilityForPromotion;
    prdWithAppraiserIsDone;
    prdDate;
    prdTime;
    reviewerRating;
    appraisalStatus;
    submittedDate;
    endDate;
    savedKPIdata = [];
    selectedStatus;
    autoSubmit;
    @track evalData = {};
    showKPI = true;

    connectedCallback() {
        this.getReviewerRecords();
        this.getAllAppraisalRecords();
        this.getAppraisalStatusRecordCounts();
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        this.selectedStatus = row.Status__c;
        switch (actionName) {
            case 'view':
                this.viewRowData(row.Id);
                this.viewAppraisal = true;
                this.editAppraisal = false;
                this.home = false;
                break;
            default:
        }
    }

    getAllAppraisalRecords() {
        getAllAppraisalRecords({ employeeId: this.employeeId })
            .then(result => {
                this.data = result;
                this.filterData = this.data;
            })
            .catch(error => {
                console.log('Error getting getAllAppraisalRecords : ' + JSON.stringify(error));
            })
    }

    viewRowData(recordId) {
        this.recordId = recordId;
        getIndividualAppraisalRecord({ recordId: this.recordId })
            .then(result => {
                this.evalData = result;
                this.employeeName = result?.EmployeeMaster__r.Name;
                this.appraisalName = result?.Name;
                this.appraiserFeedback = result?.AppraiserFeedback__c;
                this.appraiserRating = result?.AppraiserRating__c;
                this.appraiserComments = result?.AppraiserComments__c;
                this.conflictFlag = result?.ConflictFlag__c;
                this.eligibilityForPromotion = result?.EligibilityForPromotion__c;
                this.overallRating = result?.OverallRating__c;
                this.overallComments = result?.OverallComments__c;
                this.reviewerRating = result?.ReviewerRating__c;
                this.appraisalStatus = result?.Status__c;
                this.submittedDate = result?.SubmittedDate__c;
                this.prdWithAppraiseeIsDone = result?.PRD_With_Appraisee_Is_Done__c;
                this.prdDateWithAppraisee = result?.PRDDateAndTime__c;
                this.prdTimeWithAppraisee = result?.PRDDuration__c;
                this.autoSubmit=result?.IsAutoSubmit__c;
                this.prdWithAppraiserIsDone = result?.PRDWithAppraiserIsDone__c;
                this.prdDateWithAppraiser = result?.PRD_Date_And_Time_Appraiser__c;
                this.prdTimeWithAppraiser = result?.PRD_Duration_Appraiser__c;
                this.apraiseeOverallRating = result?.ApraiseeOverallRating__c;
                this.justificationForEligibility = result?.JustificationForEligibility__c;
                if (this.appraisalStatus == 'Pending with Reviewer') {
                    this.editAppraisal = true;
                    this.showKPI = true;
                }
                if(this.appraisalStatus == 'Initiated' || this.appraisalStatus == 'Submitted' || this.appraisalStatus == 'Submitted by Appraiser' || this.appraisalStatus == 'Auto Submitted'){
                    this.showKPI = false;
                }
            })
            .catch(error => {
                console.log('getIndividualAppraisalRecord', JSON.stringify(error));
            })
    }

    handleBack() {
        this.home = true;
        this.viewAppraisal = false;
    }

    getAppraisalStatusRecordCounts() {
        getAppraisalStatusRecordCounts({ employeeId: this.employeeId })
            .then(result => {
                this.statusData = result;
            })
            .catch(error => {
                console.log('Error getting getAppraisalStatusRecordCounts : ' + JSON.stringify(error));
            })
    }

    handleStatusRowAction(event) {
        const statusVal = event.currentTarget.dataset.statusvalue;
        let value = '[data-statusvalue="' + statusVal + '"]';

        this.filterData = this.data.filter(record => record.Status__c == statusVal);
        let staBdgLst = this.template.querySelectorAll(('.dashStatBdg'));
        staBdgLst.forEach(element => {
            element.classList.remove('slds-badge_inverse');
        });

        if (statusVal == 'Initiated') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Not Initiated') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Pending with Reviewer') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Submitted') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Signed By Appraiser') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Final Rating Available') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        } else if (statusVal == 'Grievance Raised') {
            this.template.querySelector(value).classList.add("slds-badge_inverse");
        }
    }

    getReviewerRecords() {
        getReviewerRecords({ employeeId: this.employeeId })
            .then(result => {
                this.data = result;
            })
            .catch(error => {
                console.log('Error getting getReviewerRecords : ' + error.message);
            })
    }

    handleOverallRating(event) {
        this.overallRating = event.target.value;
    }

    handleOverallComments(event) {
        this.overallComments = event.target.value;
    }

    handleEligibilityForPromotion(event) {
        this.eligibilityForPromotion = event.target.checked;
    }

    handleSave() {
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
                else if(!this.isInputValid('check')){
                  if (this.overallComments == '' || this.overallComments == undefined) {
                    const toastEvent = new ShowToastEvent({
                        title: 'Error',
                        message: 'Please fill the Reviewer Comments',
                        variant: 'error'
                    });
                    this.dispatchEvent(toastEvent);
                }    
            } else {
                    console.log();
                    updateAppraisal({ recordId: this.recordId, overallRating: this.overallRating, overallComments: this.overallComments, eligibilityForPromotion: this.eligibilityForPromotion })
                        .then(result => {
                            this.evalData = result;
                            const successEvent = new ShowToastEvent({
                                title: 'Success',
                                message: 'Saved successfully!',
                                variant: 'success'
                            });
                            this.dispatchEvent(successEvent);
                        })
                        .catch(error => {
                            console.log('Error while updating pending articles info : ' + error.message);
                        })
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleFinalize() {
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
                else if(!this.isInputValid('check')){
                  if (this.overallComments == '' || this.overallComments == undefined) {
                    const toastEvent = new ShowToastEvent({
                        title: 'Error',
                        message: 'Please fill the Reviewer Comments',
                        variant: 'error'
                    });
                    this.dispatchEvent(toastEvent);
                }
                
            }
            else if(this.autoSubmit == true && this.overallRating > 2){            
                const event = new ShowToastEvent({
                    title: 'Error',
                    message: 'Overall rating should be less than 3 for Auto Submitted Appraisals',
                    variant: 'error',
                    mode: 'pester'
                });
                this.dispatchEvent(event);
            } else {
                    finalizeAppraisal({ recordId: this.recordId })
                        .then(result => {
                            this.getReviewerRecords();
                            const successEvent = new ShowToastEvent({
                                title: 'Success',
                                message: 'Appraisal form has finalized!',
                                variant: 'success'
                            });
                            this.dispatchEvent(successEvent);
                            this.handleBack();
                        })
                        .catch(error => {
                            console.log('Error while updating pending articles info : ' + error.message);
                        })
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleFinal() {
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