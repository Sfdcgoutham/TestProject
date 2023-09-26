import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TASK_TRACKER from '@salesforce/schema/Task_Tracker__c';
import RATING_FIELD from '@salesforce/schema/Task_Tracker__c.SelfRating__c';
import saveKpi from '@salesforce/apex/CCT_PmsPersonalDetailsController.saveKpi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getDeleteRec from '@salesforce/apex/CCT_PmsPersonalDetailsController.getDeleteRec';
import uploadfile from '@salesforce/apex/OneDriveIntegration.uploadFileContentsForPMS';
import getDownloadLink from '@salesforce/apex/OneDriveIntegration.getDownloadLink';
import getIndividualAppraisalRecord from '@salesforce/apex/CCT_PMSReviewer.getIndividualAppraisalRecord';
import getAllAttachmentRecords from '@salesforce/apex/CCT_PmsPersonalDetailsController.getAllAttachmentRecords';

const actions = [
    { label: 'View', name: 'view' },
];

const attachmentColumns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'File Size', fieldName: 'File_Size__c'},
    { label: 'File Type', fieldName: 'File_Type__c' },
    {
        label: 'Actions',
        type: 'button-icon',
        fixedWidth: 80,        
        typeAttributes:
        {
            iconName: 'utility:download',
            name: 'view',
            iconClass: 'slds-icon-text-default slds-icon_xx-small'
        }
    },
];

export default class LCT_KpiCard extends LightningElement {
    @api kpiData;
    @api kpiMap = new Map();
    @track kpiDataList;
    @track statusOptions;
    @track justification;
    @track challenges;
    @track selfRating;
    @track weightageValue;
    metadataList = [];
    newData = [];
    @api evalRecordId;
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;
    @track fieldList;
    kpiArray = [];
    @track validationErrors = {};
    @track showRecords=[];
    columns = attachmentColumns;
    attachmentsData = [];
    showDownload = false;
    @api selectedStatus;
    accLink;
    //File upload fields
    kpiRecordId;
    InputFileName = '';
    fileData;
    Sobjecttype = 'Task_Tracker__c';
    fileNames;
    @track showDelete=false;
    @track employeeId;
   // @track inputClass = '';
    // @track kpiList=[];

    @wire(getObjectInfo, { objectApiName: TASK_TRACKER })
    trackerInfo;
    @wire(getPicklistValues, { recordTypeId: '$trackerInfo.data.defaultRecordTypeId', fieldApiName: RATING_FIELD })
    statusValueInfo({ data, error }) {
        if (data) {
            this.statusOptions = data.values;
        }
    }

    connectedCallback() {
        JSON.parse(JSON.stringify(this.kpiData)).forEach(kpi=>{
            this.kpiMap.set(kpi.Id,kpi);
        });
        this.showRecords=this.kpiData;
        console.log('this.showRecords');
        console.log(JSON.stringify(this.kpiData));
        console.log(this.showRecords);
        console.log('----KPI Map---->');
        console.log(this.kpiMap);
        console.log('selectedStatus'+this.selectedStatus);
        if(this.selectedStatus=='Initiated'){
            this.showDelete=true;
        }
        //this.getAppraisalRecord();
    }

    handleChange(event){
        const kpiId = event.currentTarget.dataset.kpiid;
        let temp = this.kpiMap.get(kpiId);
        //console.log(JSON.parse(JSON.stringify(temp)));
        let fieldName = event.currentTarget.dataset.fieldApi;
        //Console.log(JSON.parse(JSON.stringify(temp)));
        //JSON.parse(JSON.stringify(temp))[fieldName]=event.target.value;
        //  console.log(Object.assign(JSON.parse(JSON.stringify(temp)), {[fieldName] : event.target.value}));
        //Object.assign(JSON.parse(JSON.stringify(temp)), {[fieldName] : event.target.value});
        temp = {...temp, [fieldName] : event.target.value};
       // console.log(JSON.parse(JSON.stringify(temp)));
        //this.kpiMap.set(kpiId, {...this.kpiMap.get(kpiId), [fieldName] : event.target.value});
        this.kpiMap.set(kpiId, temp);
    }

    justificationHandler(event) {
        this.justification = event.target.value;
    }

    challengesHandler(event) {
        this.challenges = event.target.value;
    }

    selfRatingHandler(event) {
        this.selfRating = event.target.value;
    }

    weightageValueHandler(event) {
        this.weightageValue = event.target.value;
    }

   
    

    handleSave(event) {
       
        const kpiId = event.currentTarget.dataset.kpiid;
        //var taskMap = `{"justification" : "${this.justification}", "challenges" : "${this.challenges}","selfRating" : "${this.selfRating}", "weightageValue" : "${this.weightageValue}", "Id":"${kpiId}"}`;
        var taskMap = this.kpiMap.get(kpiId);
        this.employeeId = this.taskMap.employeeId;
        console.log(employeeId);
        console.log(this.isAppraiser);
        if (this.isAppraiser || this.isReviewer) {
            //let showErrorToast = false;
            if(!this.isInputValid(kpiId)){
            if (taskMap.Appraiser_Weightage_for_Each_KPIs__c === '' || taskMap.Appraiser_Weightage_for_Each_KPIs__c === undefined) {
               // showErrorToast = true;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'Please provide Weightage',
                    variant: 'error',
                    mode: 'pester'
                }));
                
            }  if (taskMap.Appraiser_Rating__c === '' || taskMap.Appraiser_Rating__c === undefined) {
                //showErrorToast = true;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'Please provide the Rating',
                    variant: 'error',
                    mode: 'pester'
                }));
            }  
        
            if (taskMap.Appraiser_Feedback__c === '' || taskMap.Appraiser_Feedback__c === undefined) {
               // showErrorToast = true;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'Please provide Appraiser Feedback',
                    variant: 'error',
                    mode: 'pester'
                }));
            }
            }
            else {
                
             if (taskMap.Appraiser_Weightage_for_Each_KPIs__c < taskMap.MinWeightage__c || taskMap.Appraiser_Weightage_for_Each_KPIs__c > taskMap.MaxWeightage__c) {
                // showErrorToast = true;
                 this.dispatchEvent(new ShowToastEvent({
                     title: 'Error',
                     message: 'Weightage should be within the range of Min. and Max. weightages',
                     variant: 'error',
                     mode: 'pester'
                 }));
             }
             else{
                saveKpi({ taskRec: taskMap })
                    .then(result => {
                        this.dispatchEvent(new ShowToastEvent({
                            title: 'Success',
                            message: taskMap.KPI_Name__c + ' is Saved Successfully',
                            variant: 'success',
                            mode: 'pester'
                        }));
                        const event = new CustomEvent('customsave');
                        this.dispatchEvent(event);
                    })
                    .catch(error => {
                        console.log(error.message);
                    });
                }
            }
        }
        

        if(this.isAppraisee){
           
            if(this.isInputValid(kpiId)){
                if(taskMap.Weightage__c<taskMap.MinWeightage__c || taskMap.Weightage__c>taskMap.MaxWeightage__c)
                {
                   
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message: 'Weightage should be within the range of Min. and Max. weightages',
                        variant: 'error',
                        mode: 'pester'
                    }),);
                }else{
                saveKpi({ taskRec: taskMap })
                .then(result => {
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: taskMap.KPI_Name__c+ ' is Saved Successfully ',
                        variant: 'success',
                        mode: 'pester'
                    }),);
                    const event = new CustomEvent('customsave');
                    this.dispatchEvent(event); 
                })
                .catch(error => {
                    console.log(error.message);
                });
            }
            } 
           else {
             
                if(taskMap.Justification__c=='' || taskMap.Justification__c==null ){
                
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message:'Please Fill the Justification',
                        variant: 'error',
                        mode: 'pester'
                    }),)
                } 
                 if(taskMap.Challenges__c=='' || taskMap.Challenges__c==null ){
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message:'Please Fill the Challenges',
                        variant: 'error',
                        mode: 'pester'
                    }),)
                } 
                if(taskMap.SelfRating__c=='' || taskMap.SelfRating__c==null){
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message:'Please Fill the Self Rating',
                        variant: 'error',
                        mode: 'pester'
                    }),)
                } 
               if(taskMap.Weightage__c==''|| taskMap.Weightage__c==null){
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message:'Please Fill the Weightage',
                    variant: 'error',
                    mode: 'pester'
                }),)
              } 
            
           
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

    handleDelete(event) {
        const kpiId = event.currentTarget.dataset.kpiid;
        getDeleteRec({ kpiId: kpiId })
            .then(() => {
              /*  let data = this.showRecords;
                this.showRecords = data.map(ele=>{
                    if(ele.Id == kpiId){
                        alert('Hiii');
                        
                    }
                })*/
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'KPI Record is Deleted Successfully',
                    variant: 'success',
                    mode: 'pester'
                }),);
              
                const deleteEvent = new CustomEvent('recorddelete', {
                    detail: { Id : kpiId }
                });
                this.dispatchEvent(deleteEvent);
            })
            .catch(error => {
                if (error.body.message.includes('Cannot delete mandatory record.')) {
                    // Display an error message if the record is mandatory
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: 'Cannot delete mandatory record.',
                        variant: 'error'
                    });
                    this.dispatchEvent(event);
                }
            });
    }

    kpiRecId;
    getKPIId(event){
        this.kpiRecId = event.currentTarget.dataset.kpiid;
        console.log('KPI Id onclick', this.kpiRecId);
    }

    // getKPIRecordId(event){
    //     this.kpiRecordId = event.currentTarget.dataset.kpiid;
    //     console.log('KPI Id onload', this.kpiRecordId);
    //     setTimeout(() => {
    //         //this.getAttachmentRecords();
    //         getAllAttachmentRecords({kpiId : this.kpiRecordId} )
    //         .then(result => {
    //             console.log('--Id-->',this.kpiRecordId);
    //             console.log('---attachmentsData--->')
    //             console.log(result);
    //             this.attachmentsData = result;
    //             this.showDownload = true;
    //         })
    //         .catch(error => {
    //             console.log('Error getting getAllAttachmentRecords : ' + JSON.stringify(error));
    //         })
    //     }, 500);
    // }

    // openfileUpload(event) {
    //     this.kpiRecordId = event.currentTarget.dataset.kpiid;
    //     this.InputFileName = '';
    //     const file = event.target.files[0];
    //     var reader = new FileReader()
    //     reader.onload = () => {
    //         var fileContent = reader.result.split(',')[1];
    //         this.fileNames = file.name.split('.');
    //         let extn = this.fileNames[this.fileNames.length - 1];
    //         this.fileNames.pop();
    //         this.fileData = {
    //             'fileName': this.fileNames.join('.'),
    //             'fileExt': extn,
    //             'fileContent': fileContent,
    //             //'sObjectType': this.Sobjecttype,
    //             'folderName1' :this.appraisalCycle, 
    //             'folderName2' :this.appraisalName,
    //             'recordId': this.kpiRecordId
    //         }
    //         this.InputFileName = this.fileNames.join('.');
    //     }
    //     reader.readAsDataURL(file)
    // }

    // handleuploaded() {
    //     console.log('Line 215 :- ');
    //     console.log(this.fileData);
    //     const { fileContent, fileName, fileExt, folderName1, folderName2, recordId } = this.fileData
    //     uploadfile(
    //     {
    //         fileContent, fileName, fileExt, folderName1, folderName2, recordId
    //     })
    //     .then(result => {
    //         this.fileData = null
    //         let title = `${fileName} uploaded successfully!!`
    //         const toastEvent = new ShowToastEvent({
    //             title,
    //             variant: "success"
    //         })
    //         this.dispatchEvent(toastEvent)
    //     })
    //     .catch((error) => {
    //         console.log('eneter catch');
    //         console.log('==in error==' + JSON.stringify(error));
    //     });
    // }

    // appraisalName;
    // appraisalCycle;
    // getAppraisalRecord(){
    //     getIndividualAppraisalRecord({ recordId: this.evalRecordId })
    //     .then(result => {
    //         console.log('-----getAppraisalRecord-----> ',result);
    //         this.appraisalName = result?.Name;
    //         this.appraisalCycle = result?.AppraisalCycle__c;
    //     })
    //     .catch(error => {
    //         console.log('Error getting getAppraisalRecord : ' + error.message );
    //     })
    // }

    // getAttachmentRecords(){
    //     getAllAttachmentRecords({kpiId : this.kpiRecordId} )
    //     .then(result => {
    //         console.log('--Id-->',this.kpiRecordId);
    //         console.log('---attachmentsData--->')
    //         console.log(result);
    //         this.attachmentsData = result;
    //         this.showDownload = true;
    //     })
    //     .catch(error => {
    //        console.log('Error getting getAllAttachmentRecords : ' + JSON.stringify(error));
    //     })
    // }

    // handleRowAction(event) {
    //     const actionName = event.detail.action.name;
    //     const attachmentId = event.detail.row.Id;
    //     switch (actionName) {
    //         case 'view':
    //             setTimeout(() => {
    //                 getDownloadLink({attachmentId : attachmentId})
    //                 .then(result => {
    //                     console.log('---attachment--->');
    //                     this.accLink = result;
    //                     console.log(this.accLink);
    //                 })
    //                 .catch(error => {
    //                 console.log('Error getting getAllAttachmentRecords : ' + JSON.stringify(error));
    //                 })
    //             }, 500);
    //             break;
    //         default:
    //     }
    // }
}