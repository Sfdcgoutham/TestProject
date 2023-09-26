import { LightningElement, api, track } from 'lwc';
import getReviewerRecords from '@salesforce/apex/CCT_PMSReviewer.getReviewerRecords';
import getAppraisalRecord from '@salesforce/apex/CCT_PMSReviewer.getAppraisalRecord';
import getAppraisalEndDate from '@salesforce/apex/CCT_PMSReviewer.getAppraisalEndDate';
import updateAppraisal from '@salesforce/apex/CCT_PMSReviewer.updateAppraisal';
import finalizeAppraisal from '@salesforce/apex/CCT_PMSReviewer.finalizeAppraisal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const actions = [
    { label: 'View', name: 'view' },
    // { label: 'Edit', name: 'edit' },
];

const columns = [
    { label: 'Name', fieldName: 'Name'},
    { label: 'Status', fieldName: 'Status__c' },
    { label: 'Appraisal Cycle', fieldName: 'Cycle__c' },
    { label: 'Submitted Date', fieldName: 'SubmittedDate__c' },
    { label: 'Appraiser', fieldName: 'AppraiserName__c' },
    {
        label: 'Actions',
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];

export default class LctReviewerPendingAppraisals extends LightningElement {
     
    @api employeeId;
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;
    @track data = [];
    columns = columns;
    record = {};
    home = true;
    viewAppraisal = false;
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
    appraisalStatus;
    submittedDate;
    endDate;
    savedKPIdata = [];

    connectedCallback() {
        this.getReviewerRecords();
        this.getAppraisalEndDate();
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            // case 'view':
            //     this.viewRowData(row);
            //     this.viewAppraisal = true;
            //     this.editAppraisal = false;
            //     this.home = false;
            //     break;
            case 'view':
                this.viewRowData(row);
                this.viewAppraisal = true;
                this.editAppraisal = true;
                this.home = false;
                break;
            default:
        }
    }

    viewRowData(row) {
        this.recordId = row.Id;
        getAppraisalRecord({ recordId: this.recordId })
            .then(result => {
                this.employeeName = result?.EmployeeMaster__r.Name;
                this.appraisalName = result?.Name;
                this.appraiserFeedback = result?.AppraiserFeedback__c;
                this.appraiserRating = result?.AppraiserRating__c;
                this.conflictFlag = result?.ConflictFlag__c;
                this.eligibilityForPromotion = result?.EligibilityForPromotion__c;
                this.overallRating = result?.OverallRating__c;
                this.overallComments = result?.OverallComments__c;
                this.prdWithAppraiserIsDone = result?.PRDWithAppraiserIsDone__c;
                this.reviewerRating = result?.ReviewerRating__c;
                this.appraisalStatus = result?.Status__c;
                this.submittedDate = result?.SubmittedDate__c;
            })
            .catch(error => {
                console.log('getAppraisalRecord', JSON.stringify(error));
            })
    }

    handleBack() {
        this.home = true;
        this.viewAppraisal = false;
    }

    getReviewerRecords(){
        getReviewerRecords({employeeId : this.employeeId} )
        .then(result => {
            console.log('-----getReviewerRecords-----> ',result);
            this.data = result;
        })
        .catch(error => {
            console.log('Error getting getReviewerRecords : ' + JSON.stringify(error));
        })
    }

    getAppraisalEndDate(){
        getAppraisalEndDate()
        .then(result => {
            this.endDate = result.End_Date__c;
        })
        .catch(error => {
            console.log('Error getting getAppraisalEndDate : ' + JSON.stringify(error));
        })
    }

    handleOverallRating(event){
        this.overallRating = event.target.value;
    }

    handleOverallComments(event){
        this.overallComments = event.target.value;
    }

    handleEligibilityForPromotion(event){
        this.eligibilityForPromotion = event.target.checked;
        console.log(this.eligibilityForPromotion);
    }

    handleSave() {
        if(this.overallRating == '' || this.overallComments == ''){
            const toastEvent = new ShowToastEvent({
                title:'Warning!',
                message:'Please fill the required fields!',
                 variant:'warning'
             });
             this.dispatchEvent(toastEvent);
        } else {
            updateAppraisal({recordId : this.recordId, overallRating : this.overallRating, overallComments : this.overallComments, eligibilityForPromotion : this.eligibilityForPromotion})
            .then(result =>{
                console.log('data updated');
                const successEvent = new ShowToastEvent({
                    title:'Success',
                    message:'Saved successfully!',
                     variant:'success'
                 });
                 this.dispatchEvent(successEvent);
            })
            .catch(error => {
                console.log('Error while updating pending articles info : ' + JSON.stringify(error));
            })
        }
    }

    handleFinalize() {
        if(this.overallRating == '' || this.overallComments == ''){
            const toastEvent = new ShowToastEvent({
                title:'Warning!',
                message:'Please fill the required fields and save!',
                 variant:'warning'
             });
             this.dispatchEvent(toastEvent);
        } else {
            finalizeAppraisal({recordId : this.recordId})
            .then(result =>{
                //window.history.back();
                this.getReviewerRecords();
                console.log('data updated');
                const successEvent = new ShowToastEvent({
                title:'Success',
                message:'Appraisal form has finalized!',
                    variant:'success'
                });
                this.dispatchEvent(successEvent);
                this.handleBack();
            })
            .catch(error => {
                console.log('Error while updating pending articles info : ' + JSON.stringify(error));
            })
        }
    }
}