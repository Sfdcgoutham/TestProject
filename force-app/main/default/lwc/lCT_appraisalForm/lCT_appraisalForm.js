import { LightningElement,api,track,wire } from 'lwc';

// import saveKpi from '@salesforce/apex/CCT_PmsPersonalDetailsController.getTaskList';
// import getEvaluationDataForCompare from '@salesforce/apex/CCT_PmsPersonalDetailsController.getEvaluationDataForCompare';
// import getTaskListForCompare from '@salesforce/apex/CCT_PmsPersonalDetailsController.getTaskListForCompare';
import checkMandatoryKpis from '@salesforce/apex/CCT_PmsPersonalDetailsController.checkMandatoryKpis';
import calSumOfTask from '@salesforce/apex/CCT_PmsPersonalDetailsController.calSumOfTask';
import calculateSumOfTask from '@salesforce/apex/CCT_AppraiserController.calculateSumOfTask';
import getKpiList from '@salesforce/apex/CCT_PmsPersonalDetailsController.getKpiList';
import getKPICustomMetadata from '@salesforce/apex/CCT_KPICustomMetadata.getKPICustomMetadata';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateEvalRecord from '@salesforce/apex/CCT_PmsPersonalDetailsController.updateEvalRecord';
import checkStatus from '@salesforce/apex/CCT_PmsPersonalDetailsController.checkStatus';

const columns2 = [
    { label: 'Name', fieldName: 'Name'},
    { label: 'KPI Name', fieldName: 'KPI_Name__c' },
    { label: 'Objectives And Key Results', fieldName: 'Objectives_And_Key_Results__c' },
    { label: 'Justification', fieldName: 'Justification__c' , type: 'text area',editable: true},
    { label: 'Rating', fieldName: 'Rating__c', type: 'number',editable: true },
   
];

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', fixedWidth: 300, wrapText: true,},
    { label: 'Status', fieldName: 'Status__c'},
    { label: 'Appraisal Cycle', fieldName: 'AppraisalCycle__c'}, 
    { label: 'Start Date', fieldName: 'Start_Date__c'},
    { label: 'End Date', fieldName: 'End_Date__c'}
];


export default class LCT_appraisalForm extends LightningElement {
    @api arrayData;
    @api designation;
    @api evalRecordId;
    @api employeeId;
    @api band;
    @api signedTemplate;
    columns2=columns2;
    functionalData=[];
    @track arrayData1=[];
    accountslist=[];
    justificationValue;
    ratingValue;
    kpiId;
    recordsToSave=[];
    home;
    weightageValue;
    @track statusOptions;
    evaluationDataCmp = [];
    taskListCmp = [];
    @track errorMessage;
    @track mandatoryKpisNotFound;
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;
    @api selectedStatus;
    @track functionalData1=[];
    @track mandKpis1 = [];
    @track  selectedKPIMap1=[];
    @track savedKPIdata=[];
    @track metadataList = [];
    @track noRecords=false;
    @track submtBtn=true;
    @track appraisalStatus;
    @track details = [];

    @track activeSections = ['A','B','C','D','E','F','G','H','I','J'];
    selectedRowsMapWithHeaderRecords=new Map();
   
    connectedCallback(){
        console.log('appraisalForm');
        console.log('evalRecordId'+this.evalRecordId);
        console.log('selectedRole'+this.selectedRole);
        console.log('selectedStatus'+this.selectedStatus);
        console.log('appraisalForm', this.arrayData);
        this.checkData();
       
        setTimeout(() => {
            if(this.selectedStatus=='Submitted by Appraiser' || this.selectedStatus=='Grievance Raised' || this.selectedStatus=='Final Rating Available' || this.selectedStatus== 'Pending with Reviewer'||this.selectedStatus=='Closed' || this.selectedStatus=='Submitted' || this.selectedStatus=='Auto Submitted'){
                this.submtBtn=false;
            }
            this.displayDynamicFields();
              }, 500);
        setTimeout(() => {
                this.getTasksData();
               },1000);
             
    }
  
    backAction(){
        console.log('back')
        this.arrayData=[];
        const initiatePage = new CustomEvent('child');
        this.dispatchEvent(initiatePage);
     
    }
    handleRecordDeletion() {  
        this.getTasksData(); 
    }
    handleSubmit() {
        calSumOfTask({ evlId : this.evalRecordId})
            .then(result => {
                console.log('calculation');
                console.log(result);
                if(result!=100){
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: 'The sum of weightages across all tasks should be 100',
                        variant: 'error',
                        mode: 'pester'
                    }),);
                   // this.errorMessage1 = 'Across all the Task Weightages sum should be 100';

                }else{
                    updateEvalRecord({evlId : this.evalRecordId})
                    .then(result => {
                        this.dispatchEvent(new ShowToastEvent({
                            title: 'Success',
                            message: 'Evaluation Form is Submitted Successfully',
                            variant: 'success',
                            mode: 'pester'
                        }),)
                        
                       })
                       setTimeout(() => {  
                        this.backAction();
                         }, 1000);
                    }

            });
        
       checkMandatoryKpis({ evlId : this.evalRecordId, band: this.band ,des: this.designation })
            .then(result => {
                console.log('checkMandatoryKpis');
                if(result.length > 0) {
                    console.log('checkMandatoryKpisinside');
                    // ${result.join(', ')}
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: 'Please Check Mandatory KPIs are Missing',
                        variant: 'error',
                        mode: 'pester'
                    }),);
                   // this.errorMessage = `Please Check Mandatory KPIs are Missing`;
                    this.mandatoryKpisNotFound = null;
                } else {
                    console.log('checkMandatoryKpielse');
                    this.errorMessage = null;
                    this.mandatoryKpisNotFound = null;
                    // Your code logic here
                }
            })
            .catch(error => {
                this.errorMessage = error.body.message;
                this.mandatoryKpisNotFound = null;
            });

           
            
     }
     getTasksData() {
       // this.functionalData1 = [];
        this.arrayData1=[];
        this.mandKpis1 = [];
        this.selectedKPIMap1=[];
        this.savedKPIdata=[];
        console.log('---getTasksData--->');
        console.log(this.selectedRole);
        console.log(this.appraisalStatus);
        getKpiList({ evlId: this.evalRecordId, userRole :this.selectedRole, status:this.appraisalStatus })
            .then(result => {

                this.functionalData1 = result;
                console.log(' this.functionalData1'+JSON.stringify(this.functionalData1))
                this.functionalData1 = Object.keys(result).map(item => ({ "label": item, "value": result[item] }));
                this.functionalData1.forEach((item) => {
                    let tempMand = {
                        "category": item.label,
                        "kpis": []
                    };
                    let ids = [];
                    let kpis = [];
                    item.value.forEach((kpi) => {
                        ids = [...ids, kpi.Id];
                        kpis = [...kpis, kpi];
                        kpi.Fields=JSON.parse(JSON.stringify(this.metadataList));
                        kpi.Fields.forEach((ele)=>{
                            // if((ele.FieldAPI__c = "Feedback__c" || ele.FieldAPI__c == "Appraiser_Rating__c" || 
                            //     ele.FieldAPI__c =="Appraiser_Weightage_for_Each_KPIs__c") && this.signedTemplate == true){
                            //         ele.Editable__c = this.signedTemplate;
                            // }
                           
                            ele.FieldValue = kpi[ele.FieldAPI__c]?kpi[ele.FieldAPI__c]:null;
                        });

                    });

                    // Check if the category's masterKPIId already exists in this.mandKpis

                  //  alert(JSON.stringify(kpis));
                  //  alert(kpis);
                    tempMand.kpis = kpis;
                    this.mandKpis1 = [...this.mandKpis1, tempMand];
                })
                this.selectedKPIMap1 = this.mandKpis1;
                this.savedKPIdata = this.selectedKPIMap1;

                console.log('------this.selectedKPIMap1 in lct_appraisalForm----', this.savedKPIdata);
                console.log('  this.showForm' + this.showForm);
                this.arrayData1=this.savedKPIdata;
                // if (this.savedKPIdata.length) {
                //     this.arrayData1=this.this.savedKPIdata;
                //     this.showForm = true;
                //     console.log('  this.showForm' + this.showForm);
                // }
                // else{
                //     this.showForm = false;
                // }
                if(this.functionalData1.length>0){
                    this.noRecords=false;
                 }
                 else{
                    this.noRecords=true;
                 }
            })
            
          
     }
     displayDynamicFields() {
        console.log('Entered into displayDynamicFields ');
        console.log(this.appraisalStatus);
        getKPICustomMetadata({ userRole: this.selectedRole, status: this.appraisalStatus })
        .then((result) => {
            this.metadataList = result;
            console.log('this.metadataList ',this.metadataList);
        })
        .catch((error) => {
            console.log('inside metadata catch error',error.message);
        });
     }
    

    dispacthingEvent(){
        const event = new CustomEvent('callform');
        this.dispatchEvent(event);
        //alert('dispacthingEvent');
    }
    checkData(){
    checkStatus({ recordId: this.evalRecordId })
    .then(result => {
        this.details = result;
        console.log('this test for appraisal status');
        this.appraiseeName = this.details[0]?.EmployeeMaster__r.Name;
        this.appraisalStatus = this.details[0]?.Status__c;
        console.log(this.appraisalStatus)
    });
    }  
   
}