import { LightningElement, api, track, wire } from 'lwc';
import getIndividualAppraisalRecord from '@salesforce/apex/CCT_PMSReviewer.getIndividualAppraisalRecord';
import updateAppraisal from '@salesforce/apex/CCT_PMSReviewer.updateAppraisal';
import finalizeAppraisal from '@salesforce/apex/CCT_PMSReviewer.finalizeAppraisal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import calculateSumOfTask from '@salesforce/apex/CCT_AppraiserController.calculateSumOfTask';
import getReviewerRecords from '@salesforce/apex/CCT_PMSReviewer.getReviewerRecords';

export default class LCT_individualAppraisalForm extends LightningElement {
    @api recordId;
    @api employeeId;
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;
    home = true;
    viewAppraisal = false;
    editReviewerAppraisal = false;
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
    @api selectedStatus;
    @track evalData = {};
    autoSubmit;
    showKPI = true;

    connectedCallback() {
        this.viewRowData();
    }

    viewRowData() {
        getIndividualAppraisalRecord({ recordId: this.recordId })
            .then(result => {
                console.log('getIndividualAppraisalRecord in individual');
                console.log(result);
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
                this.appraisalCycle = result?.AppraisalCycle__c;
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
                    this.editReviewerAppraisal = true;
                }
                if(this.appraisalStatus == 'Initiated' || this.appraisalStatus == 'Submitted' || this.appraisalStatus == 'Submitted by Appraiser' || this.appraisalStatus == 'Auto Submitted'){
                    this.showKPI = false;
                }
            })
            .catch(error => {
                console.log('getIndividualAppraisalRecord', error);
            })
    }

    handleBack() {
        this.home = true;
        this.viewAppraisal = false;
        const backevent = new CustomEvent('backevent');
        this.dispatchEvent(backevent);
    }

    getReviewerRecords() {
        getReviewerRecords({ employeeId: this.employeeId })
            .then(result => {
                this.data = result;
            })
            .catch(error => {
                console.log('Error getting getReviewerRecords : ', error);
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
        console.log(this.eligibilityForPromotion);
    }

    handleSave() {
        calculateSumOfTask({ evlId: this.recordId })
            .then(result => {
                console.log('calculation');
                console.log(result);
                if (!this.isInputValid('check')) {
                    if (result !== 100) {
                        const event = new ShowToastEvent({
                            title: 'Error',
                            message: 'The sum of weightages across all tasks should be 100',
                            variant: 'error',
                            mode: 'pester'
                        });
                        this.dispatchEvent(event);
                    } else if (this.overallComments == '' || this.overallComments == undefined) {
                        const toastEvent = new ShowToastEvent({
                            title: 'Error',
                            message: 'Please fill the Reviewer Comments',
                            variant: 'error'
                        });
                        this.dispatchEvent(toastEvent);
                    }
                } else {
                    updateAppraisal({ recordId: this.recordId, overallRating: this.overallRating, overallComments: this.overallComments, eligibilityForPromotion: this.eligibilityForPromotion })
                        .then(result => {
                            const successEvent = new ShowToastEvent({
                                title: 'Success',
                                message: 'Saved successfully!',
                                variant: 'success'
                            });
                            this.dispatchEvent(successEvent);
                            //this.handleBack();
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
                if (!this.isInputValid('check')) {
                    if (result !== 100) {
                        const event = new ShowToastEvent({
                            title: 'Error',
                            message: 'The sum of weightages across all tasks should be 100',
                            variant: 'error',
                            mode: 'pester'
                        });
                        this.dispatchEvent(event);
                    } else if (this.overallComments == '' || this.overallComments == undefined) {
                        const toastEvent = new ShowToastEvent({
                            title: 'Error',
                            message: 'Please fill the Reviewer Comments',
                            variant: 'error'
                        });
                        this.dispatchEvent(toastEvent);
                    }

                }
                else if (this.autoSubmit == true && this.overallRating > 2) {
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: 'Overall rating should be less than 3 for Auto Submitted Appraisals',
                        variant: 'error',
                        mode: 'pester'
                    });
                    this.dispatchEvent(event);
                }
                else {
                    finalizeAppraisal({ recordId: this.recordId })
                        .then(result => {
                            //this.getReviewerRecords();
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
        this.viewRowData();
    }

    isInputValid(res) {
        let name = '.' + res;
        let isValid = true;
        let inputFields = this.template.querySelectorAll(name);
        inputFields.forEach(inputField => {
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }

}