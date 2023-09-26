import { LightningElement , api,wire, track} from 'lwc';
import getAppraiseeList from '@salesforce/apex/CCT_AppraiserController.getAppraiseeList';
import fetchAppraisalForm from '@salesforce/apex/CCT_AppraiserController.fetchAppraisalForm';
import fetchTermCycleRecords from '@salesforce/apex/CCT_AppraiserController.fetchTermCycleRecords';


const COLUMNS = [
    { label: 'Name', fieldName: 'Name', fixedWidth: 300, wrapText: true,},
    { label: 'Status', fieldName: 'Status__c'},
    { label: 'Appraisal Cycle', fieldName: 'AppraisalCycle__c'}, 
    { label: 'Start Date', fieldName: 'Start_Date__c'},
    { label: 'End Date', fieldName: 'End_Date__c'},
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


const COLUMNS1 = [
    { label: 'Name', fieldName: 'Name',wrapText: true,},
    { label: 'Designation', fieldName: 'Designation__c'},
    { label: 'Band', fieldName: 'Band__c'},
    { label: 'Appraisal Cycle', fieldName: 'AppraisalCycle__c'},
    { label: 'Employee Joining Date', fieldName: 'Employee_Joining_Date__c'},
    {
        label: 'Actions',
            type: 'button-icon',       
            typeAttributes:
            {
                iconName: 'utility:preview',
                name: 'view',
                iconClass: 'slds-icon-text-default slds-icon_xx-small'
            }
    },
];
    





export default class LctMyTeam extends LightningElement {

    @api employeeId;
    @track columns = COLUMNS1;
    @track columns1 = COLUMNS;
    @track data = [];
    @track kpiList;
    @track error;
    @track record = {};
    @track showView = false;
    @track empId;
    @track empEmail;
    @track records = [];
    @track showChild = false;
    @track firstCall = false;
    @track data2 = [];
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;
    @api selectedStatus;
    @track appraisalStatus;
    @track viewAppraisal = false;
    @track recordId;
    @track appraisalCycle;
    @track designation;

    @track signedTemplate = true;
    @track appraisalList = true;

    //to pass in child
   
    @track cRowData=[];

    connectedCallback(){

        getAppraiseeList({employeeId:this.employeeId, role : this.selectedRole})
        .then(result=>{
            this.data = result;
            console.log('MyTeam :- ',this.data);
           //alert('My Team');
        })
        .catch(error=>{
          //  alert(JSON.stringify(error));  
        })
    }

    call(){
        fetchAppraisalForm({des:this.designation})
        .then(result=>{
            this.records = result;
            console.log('--fetchAppraisalForm-->',result);
            this.firstCall = true;
        })
        .catch(error=>{
            
        })
    }
    
    renderedCallback(){
        if(!this.firstCall){
            this.call();
        }
    }

    handleRowAction(event){
        this.record = {};
        const recId =  event.detail.row.Id;  
        const actionName = event.detail.action.name;  
        this.record = this.data.filter(rec => rec.Id === recId)[0];
        this.empId = this.record.Id;
        this.empEmail = this.record.Email;
        this.designation = this.record.Designation__c;
        this.appraisalCycle = event.detail.row.AppraisalCycle__c;
        console.log(this.record);
        if ( actionName == 'view' ) {   
            this.showChild = true;
            this.fetchTermCycleRecords();
        } 
    }

    handleRowAction1(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
       // console.log('Row=>',row);
        switch (actionName) {
            case 'view':
                this.recordId = row.Id;
                console.log('recordId 1 ==>',this.recordId);
                this.viewAppraisal = true;
                this.appraisalList = false;
                this.appraisalCycle = row.AppraisalCycle__c;
                // this.cRowData=row;
                break;
            case 'edit':
                this.viewAppraisal = false;
                break;
            default:
        }
    }


    fetchTermCycleRecords(){
        this.data2 =[];
      //  alert(this.empId);
      //  alert(this.appraisalCycle);
        fetchTermCycleRecords({appraiserId : this.empId,appraisalCycle:this.appraisalCycle} )
        .then(result => {
            //  alert(JSON.stringify(result));
            console.log('--fetchTermCycleRecords-->');
            console.log(result);
            this.data2 = result;
            this.showView = result.length > 0 ? true : false;
        })
        .catch(error => {
          //  alert(JSON.stringify(error));
            console.log('Error getting fetchTermCycleRecords : ' + JSON.stringify(error));
        })
    }
    handleBack(){
        this.showView = false;
    }
    handleBack1(){
        this.viewAppraisal = false;
        this.showView = true;
        this.appraisalList=true;
        console.log('data2==>',this.data2.length);
        console.log('appraisalList==>',this.appraisalList);
       // this.fetchTermCycleRecords();

    }
    handleViewAppraisal(event) {
        const recordId = event.target.dataset.recordId;
        this.recordId = recordId;
        this.viewAppraisal = true;
        this.appraisalList = false;
    }
    
    
}