import { LightningElement, track, api, wire } from 'lwc';
import checkStatus from '@salesforce/apex/CCT_PmsPersonalDetailsController.checkStatus';
import updateRecord from '@salesforce/apex/CCT_PmsPersonalDetailsController.updateRecordSent';
import insertAddhocRecord from '@salesforce/apex/CCT_PmsPersonalDetailsController.insertAddhocRecord';
import updateAppraisalFormStatus from '@salesforce/apex/CCT_PmsPersonalDetailsController.updateAppraisalFormStatus';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//import updateAppraisalFormGrivence from '@salesforce/apex/CCT_PmsPersonalDetailsController.updateAppraisalFormGrivence';
//import updateAppraisalFormClose from '@salesforce/apex/CCT_PmsPersonalDetailsController.updateAppraisalFormClose';
import TASK_TRACKER from '@salesforce/schema/Task_Tracker__c';
import RATING_FIELD from '@salesforce/schema/Task_Tracker__c.SelfRating__c';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';







export default class LCT_viewAppraisalForm extends LightningElement {
    @api detailViewRecord;
    @api showButtons = false;
    @api initiate = false;
    @api evalRecordId;
    @track appraiseeName;
    @track details = [];
    @track appraisalStatus;
    @api isReviewer;
    startDate;
    endDate;
    reviewerName;
    appraiserName;
    designation;
    cycle;
    @track addBtn=true;
    @track isButtonDisabled = true;
    @track prdWithAppraiserIsDone = false;
    @track prdform=false;
    @track closureComments;
    @track conflictFlag = false;
    @track submittedDate;
    @track Appraisercomments;
    @track prdDate;
    @track prdTime;
    @track submitStatus;
    @track sentBtn=true;
    @track finalRating;
    @track reviewerFeedback;
    @track showFinalRating=false;
    @track showPopup = false;
    @track recordValue = '';
    @track grievenceComment;
    @track showPopupClose=false;
    @track enableBtn;
    @track overallRating;
    @track addAdhocKpi=false;
    @track justificationAddhoc;
    @track selfRatingAddhoc;
    @track weightageAddhoc;
    @track challengesAddhoc;
    @track kpiName;
    @track whatCanBeDoneBetter;
    @track whatHappenedWell;
    @track overallRatingtrue;
    @track dateTrue;
    @wire(getObjectInfo, { objectApiName: TASK_TRACKER })
    trackerInfo;
    @wire(getPicklistValues, { recordTypeId: '$trackerInfo.data.defaultRecordTypeId', fieldApiName: RATING_FIELD })
    statusValueInfo({ data, error }) {
        if (data) {
            this.statusOptions = data.values;
        }
    }

    connectedCallback() {
       this.getEmpData();    
    }

    handleClick(event) {
        let eventName;
        if (event.currentTarget.name === 'initiate') {
            eventName = 'initate';
            setTimeout(() => { 
                this.getEmpData();
             }, 500);
        } else if (event.currentTarget.name === 'addGoals') {
            eventName = 'addgoals';
        }
        else if (event.currentTarget.name === 'cancel') {
            eventName = 'cancel';
        }
        let custEvent = new CustomEvent('btnclick',
            {
                'detail': { name: eventName}
            }
        );
        this.dispatchEvent(custEvent);
    }
    getEmpData() {
        console.log('hi check status' + this.evalRecordId);
        checkStatus({ recordId: this.evalRecordId })
            .then(result => {
                this.details = result;
                console.log('hi check status' );
                console.log(this.details);
                this.appraiseeName = this.details[0]?.EmployeeMaster__r.Name;
                this.appraisalStatus = this.details[0]?.Status__c;
                this.startDate = this.details[0]?.Start_Date__c;
                this.endDate = this.details[0]?.End_Date__c;
                this.reviewerName = this.details[0]?.ReviewerName__c;
                this.appraiserName = this.details[0]?.AppraiserName__c;
                this.designation = this.details[0]?.EmployeeMaster__r.Designation__c;
                this.cycle = this.details[0]?.AppraisalCycle__c;
                this.prdWithAppraiserIsDone = this.details[0]?.PRDWithAppraiserIsDone__c;
                this.conflictFlag = this.details[0]?.ConflictFlag__c;
                this.submittedDate=this.details[0]?.SubmittedDate__c;
                this.overallRating = this.details[0]?.ApraiseeOverallRating__c;
                this.appraiserComments= this.details[0]?.AppraiserComments__c;
                this.prdDate = this.details[0]?.PRDDateAndTime__c;
                this.prdTime = this.details[0]?.PRDDuration__c,
                this.whatCanBeDoneBetter= this.details[0]?.WhatCanBeDoneBetter__c,
                this.whatHappenedWell= this.details[0]?.WhatHappenedWell__c,
                console.log('appraisalStatus'+this.appraisalStatus);
                if( this.appraisalStatus =='Initiated' ){
                    this.isButtonDisabled = false;
                    this.showFinalRating=false;
                    this.submitStatus=true;
                    this.overallRatingtrue=false;
                }
                if( this.appraisalStatus =='Submitted by Appraiser'){
                    this.prdform = true;
                    this.showFinalRating=false;
                    this.submitStatus=false;
                    this.sentBtn=true;
                    this.overallRatingtrue=true;
                }
                if( this.appraisalStatus =='Submitted'){
                    this.prdform = false;
                    this.showFinalRating=false;
                    this.submitStatus=false;
                    this.sentBtn=false;
                    this.enableBtn=false;
                    this.overallRatingtrue=true;
                    this.dateTrue=true;
                }
                if( this.appraisalStatus =='Final Rating Available'){
                    this.prdform = true;
                   this.showFinalRating=true;
                    this.submitStatus=true;
                    this.sentBtn=false;
                    this.enableBtn=true;
                    this.overallRatingtrue=true;
                   this.finalRating=this.details[0]?.ReviewerRating__c;
                    this.reviewerFeedback=this.details[0]?.OverallComments__c;
                }
                if( this.appraisalStatus =='Pending with Reviewer'){
                    this.prdform = true;
                    this.showFinalRating=false;
                    this.submitStatus=true;
                    this.sentBtn=false;
                    this.isButtonDisabled=true;
                    this.enableBtn=false;
                    this.overallRatingtrue=true;
                }
                if( this.appraisalStatus =='Grievance Raised'){
                    this.prdform = true;
                    this.showFinalRating=true;
                    this.submitStatus=true;
                    this.sentBtn=false;
                    this.enableBtn=false;
                    this.overallRatingtrue=true;
                    this.grievenceComment=this.details[0]?.GrievenceComment__c;
                    this.finalRating=this.details[0]?.ReviewerRating__c;
                    this.reviewerFeedback=this.details[0]?.OverallComments__c;
                }
                if( this.appraisalStatus =='Closed'){
                    this.prdform = true;
                    this.showFinalRating=true;
                    this.submitStatus=true;
                    this.sentBtn=false;
                    this.enableBtn=false;
                    this.closureComments =  this.details[0]?.ClosureComments__c;
                  //  this.finalRating=this.details[0]?.ReviewerRating__c;
                    this.reviewerFeedback=this.details[0]?.OverallComments__c;

                }
        });
   }
   inputHandler(event){
    if(event.target.name == 'prdWithAppraiserIsDone'){
      
        this.prdWithAppraiserIsDone = event.target.checked;
    } 
    if(event.target.name == 'closurecomments'){
        this.closureComments = event.target.value;
    }
    if(event.target.name == 'conflictflag'){
        this.conflictFlag = event.target.checked;
    } 
    if(event.target.name == 'appraiserComment'){
        this.appraiserComments = event.target.value;
    }
    if(event.target.name == 'prdDate'){
        this.prdDate = event.target.value;
    }
    if(event.target.name == 'prdTime'){
        this.prdTime = event.target.value;
    }
    if(event.target.name == 'grievenceComment'){
        this.grievenceComment = event.target.value;
    }
   }
   handleSave(event){
    let record ={   
                    "Id":this.evalRecordId,
                    "ClosureComments__c":this.closureComments,
                    "PRDDateAndTime__c":this.prdDate,
                    "PRDWithAppraiserIsDone__c":this.prdWithAppraiserIsDone,
                    "PRDDuration__c":this.prdTime,
                    "AppraiserComments__c":this.appraiserComments,
                    "ConflictFlag__c":this.conflictFlag,
                };
                
 if(!this.isInputValid('inputCss')){
   if(record.PRDWithAppraiserIsDone__c==true && record.PRDDateAndTime__c==undefined || record.PRDDateAndTime__c=='' ){
    this.dispatchEvent(new ShowToastEvent({
        title: 'Error',
        message:'Please Fill the PRD Date ',
        variant: 'error',
        mode: 'pester'
    }),)
   }
   if(record.PRDWithAppraiserIsDone__c==true && record.PRDDuration__c==undefined || record.PRDDuration__c=='' ){
    this.dispatchEvent(new ShowToastEvent({
        title: 'Error',
        message:'Please Fill the PRD Duration',
        variant: 'error',
        mode: 'pester'
    }),)
   }
 }
   else{
    updateRecord({record :record})
    .then(result=>{
        this.closureComments = '';
        this.prdDate = '';
        this.prdWithAppraiserIsDone =false;
        //this.appraiserComments = '';
        this.prdTime='';
        this.conflictFlag=false;
       
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: 'The Appraisal Form is Saved Successfully',
            variant: 'Success',
            mode: 'pester'
        }),);
        setTimeout(() => {
            //location.reload();
           this.getEmpData();
         }, 50);
    // const callparent = new CustomEvent('sent');
    // this.dispatchEvent(callparent);
        
    })
  
    .catch(error=>{
        
    })
  }
  }
  
 
  handleSentForReview() {
   
            updateAppraisalFormStatus({ evlId: this.evalRecordId})
            .then(result => {
                const successMessage = 'Appraisal form is Submitted to Reviewer';
            const successEvent = new ShowToastEvent({
                title:'Success',
                message:successMessage,
                variant:'success'
            });
            this.dispatchEvent(successEvent);
            const callparent = new CustomEvent('sent');
            this.dispatchEvent(callparent);
                

            })
            .catch(error => {
            
            });
  }
  handleGrievence() {
    
            updateAppraisalFormGrivence({ evlId: this.evalRecordId , gcomment : this.grievenceComment})
            .then(result => {
                const successMessage = 'Appraisal form is Submitted to Grievence Request';
            const successEvent = new ShowToastEvent({
                title:'Success',
                message:successMessage,
                variant:'success'
            });
            this.dispatchEvent(successEvent);
            const callparent = new CustomEvent('sent');
            this.dispatchEvent(callparent);
                
        
            })
            .catch(error => {
            
            });
   }
   handleCloseForm() {
            updateAppraisalFormClose({ evlId: this.evalRecordId, closurecomment:this.closureComments})
            .then(result => {
                const successMessage = 'Appraisal form is Closed';
            const successEvent = new ShowToastEvent({
                title:'Success',
                message:successMessage,
                variant:'success'
            });
            this.dispatchEvent(successEvent);
            const callparent = new CustomEvent('sent');
            this.dispatchEvent(callparent);
            })
            .catch(error => {
            
            });
     }
        openPopup() {
            this.showPopup = true;
        }

        closePopup() {
            this.showPopup = false;
        }
        openPopupClose() {
            this.showPopupClose = true;
        }

        closePopupClose() {
            this.showPopupClose = false;
        }

 
  dispacthingEvent(){
    const event = new CustomEvent('callform');
    this.dispatchEvent(event);
    //alert('dispacthingEvent');
 }
 openAddhoc(){
   this.addAdhocKpi=true;
 }
 closePopupAddhoc(){
    this.addAdhocKpi=false;
 }
 handlerAddhoc(event){
    if(event.target.name == 'kpiname'){
        this.kpiName = event.target.value;
    } 
    if(event.target.name == 'justification'){
        this.justificationAddhoc = event.target.value;
    } 
    if(event.target.name == 'challenges'){
        this.challengesAddhoc = event.target.value;
    }
    if(event.target.name == 'selfRating'){
        this.selfRatingAddhoc = event.target.value;
    } 
    if(event.target.name == 'weightage'){
        this.weightageAddhoc = event.target.value;
    }
 }
 handleSaveAddhoc(event){
    
    let record ={   
                    "Evaluation__c":this.evalRecordId,
                    "KPI_Name__c":this.kpiName,
                    "Justification__c":this.justificationAddhoc,
                    "Challenges__c":this.challengesAddhoc,
                    "SelfRating__c":this.selfRatingAddhoc,
                    "Weightage__c":this.weightageAddhoc,
                    "KPICategory__c":'Adhoc',
                    "MinWeightage__c":0,
                    "MaxWeightage__c":100
                    
                };
                
            console.log(record)    
    //alert(JSON.stringify(recordId));
        if(this.isInputValid('validity')){
                
            insertAddhocRecord({record :record})
            .then(result=>{
                this.kpiName='';
                this.justificationAddhoc = '';
                this.selfRatingAddhoc = '';
                this.weightageAddhoc ='';
                this.challengesAddhoc = '';
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'The Addhoc KPI Record is Saved Successfully',
                    variant: 'Success',
                    mode: 'pester'
                }),);
                const callparent = new CustomEvent('sent');
                this.dispatchEvent(callparent);
            })
        
            .catch(error=>{

            }) 
        }
 
  else{
            if(record.KPI_Name__c=='' || record.KPI_Name__c==undefined ){
                        
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message:'Please Fill the KPI Name',
                    variant: 'error',
                    mode: 'pester'
                }),)
            } 
            if(record.Justification__c=='' || record.Justification__c==undefined ){
                
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message:'Please Fill the Justification',
                    variant: 'error',
                    mode: 'pester'
                }),)
            } 
            if(record.Challenges__c=='' || record.Challenges__c==undefined ){
                
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message:'Please Fill the Challenges',
                    variant: 'error',
                    mode: 'pester'
                }),)
            } 
            if(record.SelfRating__c==='' || record.SelfRating__c===undefined){
            
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message:'Please Fill the Self Rating',
                    variant: 'error',
                    mode: 'pester'
                }),)
            } 
        if(record.Weightage__c==''|| record.Weightage__c==undefined){
        
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message:'Please Fill the Weightage',
                variant: 'error',
                mode: 'pester'
            }),)
        }
  }
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