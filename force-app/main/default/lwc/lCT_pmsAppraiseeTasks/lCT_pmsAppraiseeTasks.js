import { LightningElement, api, track } from 'lwc';
import getApraiseeRecords from '@salesforce/apex/CCT_PmsPersonalDetailsController.getApraiseeRecords';
import checkStatus from '@salesforce/apex/CCT_PmsPersonalDetailsController.checkStatus';
import compareList from '@salesforce/apex/CCT_PmsPersonalDetailsController.compareList';
//import checkKpidata1 from '@salesforce/apex/PmsPersonalDetailsController.checkKpidata1';
import displayKpi from '@salesforce/apex/CCT_PmsPersonalDetailsController.displayKpi';
import updateApraisalRecord from '@salesforce/apex/CCT_PmsPersonalDetailsController.updateApraisalRecord';
import insertApraiseeTasks from '@salesforce/apex/CCT_PmsPersonalDetailsController.insertApraiseeTasks';
import getKpiList from '@salesforce/apex/CCT_PmsPersonalDetailsController.getKpiList';
import getKPICustomMetadata from '@salesforce/apex/CCT_KPICustomMetadata.getKPICustomMetadata';
import getTaskList from '@salesforce/apex/CCT_PmsPersonalDetailsController.getTaskList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const actions = [
    { label: 'View', name: 'view' },

];

const columns = [
    {
        label: 'Name',
        fieldName: 'Name',
       // hideDefaultActions: true,
        wrapText: false
    },
    // { label: 'Eligibility For Promotion', fieldName: 'EligibilityForPromotion__c' },
    {
        label: 'Status',
        fieldName: 'Status__c',
        //hideDefaultActions: true,
        wrapText: false
    },

    {
        label: 'Start Date',
        fieldName: 'Start_Date__c',
        //hideDefaultActions: true,
        wrapText: false
    },
    {
        label: 'End Date',
        fieldName: 'End_Date__c',
        //hideDefaultActions: true,
        wrapText: false
    },
    // {
    //     label: 'Submitted Date',
    //     fieldName: 'SubmittedDate__c',
    //     hideDefaultActions: true,
    //     wrapText: false
    // },
    {
        label: '',
        type: 'action',
        hideLabel: true,
        hideDefaultActions: true,
        wrapText: false,
        typeAttributes: { rowActions: actions },
    },
];
const columns1 = [

    // { label: 'Eligibility For Promotion', fieldName: 'EligibilityForPromotion__c' },
    { label: 'KPI Name', fieldName: 'KPI_Name__c', initialWidth: 250 },
    { label: 'Objectives And Key Results', fieldName: 'Objectives_And_Key_Results__c', initialWidth: 320 },
    { label: 'Max Weightage', fieldName: 'MaxWeightage__c', initialWidth: 150 },
    { label: 'Min Weightage', fieldName: 'MinWeightage__c', initialWidth: 150 },
    { label: 'Mandatory', fieldName: 'Mandatory__c', type: 'boolean', initialWidth: 100 },

];

export default class LCT_pmsAppraiseeTasks extends LightningElement {
    @api employeeId;
    @track detailViewRecord = [];
    @api designation;
    @api band;
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;
    home = true;
    @track appraisalFormList = [];
    @track functionalData = [];
    functionalData1 = [];
    LearningData = [];
    OrganizationalData = [];
    StretchData = [];
    columns = columns;
    columns1 = columns1;
    @track initiateButton = false;
    employeeName;
    appraiseeName;
    appraiserFeedback;
    appraiserRating;
    conflictFlag;
    eligibilityForPromotion;
    overallRating;
    prdWithAppraiserIsDone;
    reviewerRating;
    @track appraisalStatus;
    submittedDate;
    startDate;
    endDate;
    reviewerName;
    appraiserName;
    fillAppraisal = false;
    formAppraisal = false;
    @track compareListofRecords = [];
    @track evaluationId;
    @track activeSections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    selectedRowsMapWithHeader = new Map();
    arrayData = [];
    @track savedKPIdata = [];
    //@track addGoals = false;
    @track initiatePage = false;
    @track mandatory;
    @track showForm=false;

    @track selectedKpiIds = [];
    @track selectedKPIMap = [];
    @track selectedKPIMap1 = [];
    @track mandKpis = [];
    mandKpis1 = [];
    @track init_selectedKPIs = [];
    footerbuttons = false;
    evalRecordId;
    @track kpiDataList = [];
    taskDetails = [];
    filteredList1 = [];
    metadataList = [];
    @track detailViewRecord=[];
    @track detailRecord=[];
    @api userRole = 'Appraisee';
    @api selectedStatus;
    //record = [];

    connectedCallback() {
       // console.log(this.designation)
       // console.log('---this.selectedRole in pms app--->',this.selectedRole);
        this.isAppraisee = true;
        this.footerbuttons = false;
        //this.getKpiDetails();
        //this.displayDynamicFields();
        this.getAppraiseDetails();
        //console.log('band' + this.band);


    }
    getAppraiseDetails() {
        getApraiseeRecords({ employeeId: this.employeeId })
            .then(result => {
                //console.log('Apraise Record')
                this.appraisalFormList = result;
            })
            .catch(error => {
                console.log('Error getting Records : ' + JSON.stringify(error));
            })
    }
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'view':
                this.home = false;
                this.validateData(row);
                break;

            default:
        }
    }
    validateData(row) {
        this.evalRecordId = row.Id;
        // console.log('hi check status :- ' + this.evalRecordId);
        // console.log(row.Status__c);
        this.selectedStatus=row.Status__c;
       // this.getTasksData();
     
        this.compareListRecordsData();
       
        checkStatus({ recordId: this.evalRecordId })
            .then(result => {
                //console.log('hi check status')
                this.detailViewRecord = result;
                //console.log(result);
                if (this.detailViewRecord[0].Status__c == 'Not Initiated') {
                    //console.log('Not Initiated');
                    this.initiatePage = true;
                    this.initiateButton = true;
                   
                    this.showForm=false;
                   
                    this.appraiseeName = this.detailViewRecord[0]?.Name;
                    this.appraisalStatus = this.detailViewRecord[0]?.Status__c;
                    this.startDate = this.detailViewRecord[0]?.Start_Date__c;
                    this.endDate = this.detailViewRecord[0]?.End_Date__c;
                    this.reviewerName = this.detailViewRecord[0]?.ReviewerName__c;
                    this.appraiserName = this.detailViewRecord[0]?.AppraiserName__c;

                }
                else if (this.detailViewRecord[0].Status__c == 'Final Rating Available') {
                   // console.log('Final Rating Available');
                    this.initiateButton = false;
                   
                   
                    this.initiatePage = true;
                    this.showForm = true;

                }
                else if (this.detailViewRecord[0].Status__c == 'Initiated' ) {
                  //  console.log('Initiated');
                  this.compareListRecordsData();
                   // this.getTasksData();
                    this.initiatePage = true;
                   // this.addGoals = true;
                   
                  this.showForm = true;
                  //
                }
                else if (this.detailViewRecord[0].Status__c =='Submitted by Appraiser' ) {
                    
                    this.compareListRecordsData();
                    this.initiatePage = true;
                    this.showForm = true;
                }
                else if (this.detailViewRecord[0].Status__c =='Submitted' ) {
                    
                    this.compareListRecordsData();
                    this.initiatePage = true;
                    this.showForm = true;
                }
                else if (this.detailViewRecord[0].Status__c =='Pending with Reviewer' ) {
                   
                    this.compareListRecordsData();
                    this.initiatePage = true;
                    this.showForm = true;
                }
                else if (this.detailViewRecord[0].Status__c =='Grievance Raised' ) {
                   
                    this.compareListRecordsData();
                    this.initiatePage = true;
                    this.showForm = true;
                }
                else if (this.detailViewRecord[0].Status__c =='Closed' ) {
                   
                    this.compareListRecordsData();
                    this.initiatePage = true;
                    this.showForm = true;
                }
                else if (this.detailViewRecord[0].Status__c =='Auto Submitted' ) {
                   
                    this.compareListRecordsData();
                    this.initiatePage = true;
                    this.showForm = true;
                }
               
            });
       // this.displayDynamicFields();
      
        this.getKpiDetails();
    }
    compareListRecordsData() {
        // console.log('evalRecordId',this.evalRecordId);
        // console.log('evalRecordId');

        compareList({ evlId: this.evalRecordId })
            .then(result => {
              //  console.log('compareListofRecords')
                this.compareListofRecords = result;
             //   console.log( this.compareListofRecords)
                

            })
    }
   /* handleInitiate(event) {
        this.initiateButton = false;
        this.viewApraisalDetails = false;
        this.fillAppraisal = true;
       // this.addGoals = false;
        console.log('id in 228' + this.evalRecordId);
        updateApraisalRecord({ employeeId: this.employeeId, recordId: this.evalRecordId })
            .then(result => {
                console.log(result);
              
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Appraisal Form is Initiated!!!',
                    variant: 'success',
                    mode: 'pester'
                }),);

            })
    }*/
    handleStatus(event){
        console.log('---status---', event.detail.status);
    }
    handlePHClick(event) {
        console.log('---handlePHClick---', event.detail.name);
       
        if (event.detail.name == 'initate') {
            this.initiateButton = false;
           
            this.fillAppraisal = false;
           // this.addGoals = false;

            // setTimeout(() => {
            //     //location.reload();
          

            // }, 500);
           
           // console.log('id in 228' + this.evalRecordId);
            updateApraisalRecord({ employeeId: this.employeeId, recordId: this.evalRecordId })
                .then(result => {
                    console.log(result);

                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: 'Appraisal Form is Initiated!!!',
                        variant: 'success',
                        mode: 'pester'
                    }),);

                })
               // this.getTasksData();

        } else if (event.detail.name == 'addgoals') {
           // console.log('addgoals')
            this.compareListRecordsData();
          //  console.log('this.appraisalStatus'+this.appraisalStatus)
            this.showForm = false;
            this.initiatePage = true;
            this.footerbuttons = true;
            this.home = false;
            checkStatus({ recordId: this.evalRecordId })
            .then(result => {
               
                this.detailRecord = result;
               // console.log('true'+this.detailRecord.Status__c)
                if (this.detailRecord.Status__c == 'Submitted by Appraiser') {
                   // console.log('if')
                    this.fillAppraisal = false;
                }
                else{
                   // console.log('true')
                    this.fillAppraisal = true;
                    this.getKpiDetails();
                }
             })
           

        }
        else if (event.detail.name == 'cancel') {
          this.getAppraiseDetails();
          this.home=true;
          this.initiatePage=false;
          this.fillAppraisal=false;
          this.showForm=false;
          this.formAppraisal=false;
          
        }
    }
    handleSent(){
       // console.log('sent')
        this.getAppraiseDetails();
          this.home=true;
          this.initiatePage=false;
          this.fillAppraisal=false;
          this.showForm=false;
          this.formAppraisal=false;
    }

    handleGoals() {
        this.fillAppraisal = true;
        
       // this.addGoals = false;
        this.initiatePage = true;
    }

    getKpiDetails() {
        this.functionalData = [];
        this.selectedKpiIds=[];
        this.init_selectedKPIs=[];
        this.mandKpis=[];
       
        displayKpi({ des: this.designation, band: this.band })//include status, Persona
            .then(data => {
               // console.log('data');
                // console.log(data);
                this.functionalData = data;


                this.functionalData = Object.keys(data).map(item => ({ "label": item, "value": data[item] }));
                this.functionalData.forEach((item) => {
                    let tempMand = {
                        "category": item.label,
                        "kpis": []
                    };
                    let ids = [];
                    let kpis = [];
                    item.value.forEach((kpi) => {
                        if (kpi.Mandatory__c) {
                            this.selectedKpiIds = [...this.selectedKpiIds, kpi.Id];
                            ids = [...ids, kpi.Id];
                            kpis = [...kpis, kpi];
                            //kpi.Fields=this.metadataList;
                        //    kpi.Fields=JSON.parse(JSON.stringify(this.metadataList));
                        //    kpi.Fields.forEach((ele)=>{
                        //        ele.FieldValue = kpi[ele.FieldAPI__c]?kpi[ele.FieldAPI__c]:null;
                        //     });
                        }
                    });

                    // Check if the category's masterKPIId already exists in this.mandKpis

                    tempMand.kpis = kpis;
                    this.mandKpis = [...this.mandKpis, tempMand];

                })
               // const uniqueIds = new Set();
                this.selectedKPIMap1.forEach(item => {
                    for (const e of this.mandKpis) {
                        if (item.category == e.category) {
                            if (e.kpis.length == 0) {
                                e.kpis = item.kpis;
                                break;
                            }

                            item.kpis.forEach(j => {

                                for (let index = 0; index < e.kpis.length; index++) {
                                    const element = e.kpis[index];
                                    if (element.Id == j.MasterKPIId__c) {
                                        break;
                                    }
                                    else if (index == e.kpis.length - 1) {
                                       // if (!uniqueIds.has(j.MasterKPIId__c)) {
                                           // uniqueIds.add(j.MasterKPIId__c);
                                            e.kpis.push(j);
                                        //}
                                    }

                                }
                            })
                        }
                    }
                })


                console.log(' this.mandKpis', this.mandKpis);

                // compareListofRecords.forEach((value, index) => {
                //   const key = 'key' + (index+1);
                //  if (!this.mandKpis.hasOwnProperty(key)) {
                //     this.mandKpis[key] = value;
                //    }
                //  });
                
                // console.log('---brfore compareListofRecords----->', this.compareListofRecords);
                // console.log('---brfore selectedKpiIds----->', this.selectedKpiIds);
                this.compareListofRecords.forEach(item => {
                    this.selectedKpiIds.forEach(item1 => {
                       //  console.log('add Records first');
                        if (item.MasterKPIId__c !== item1.Id) {
                            // console.log('add Records secnd');
                            if (!this.selectedKpiIds.includes(item.MasterKPIId__c)) {
                                this.selectedKpiIds.push(item.MasterKPIId__c);
                            }
                        }
                    });
                });

                this.selectedKPIMap = this.mandKpis;
                this.init_selectedKPIs = this.selectedKpiIds;
                // console.log('---mandKpis----->', this.mandKpis);
                // console.log('---selectedKpiIds----->', this.selectedKpiIds);
                // console.log('---functionalData----->', this.functionalData);
                // console.log('---init_selectedKPIs----->', this.init_selectedKPIs);


            })
            .catch(error => {
                console.log('Error getting Records : ' + JSON.stringify(error));
            })
    }
    getSelectedRec() {
        this.kpiDataList=[];
        this.selectedKPIMap;
        this.arrayData = this.selectedKPIMap;
        this.fillAppraisal = false;
        this.selectedKPIMap.map(ele => {
            ele.kpis?.map(rec => {
                this.kpiDataList = [...this.kpiDataList, rec];
            })
        })
        // console.log('-----------otherIds---');
        // console.log(this.compareListofRecords);
        console.log(this.kpiDataList);



        this.compareListofRecords.forEach(item => {
            this.kpiDataList.forEach((item1, index) => {
                if (item.MasterKPIId__c === item1.Id) {
                    console.log('hi');
                    console.log('Match found:', item, item1);
                    this.kpiDataList.splice(index, 1);
                }
            });
        });
        // console.log('----this.kpiDataList-->')
        // console.log(this.kpiDataList);
        insertApraiseeTasks({ employeeId: this.employeeId, recordId: this.evalRecordId, kpiList: this.kpiDataList })
            .then(result => {
                console.log(result);
                console.log('upsert');
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'KPI Record is Saved Successfully',
                    variant: 'success',
                    mode: 'pester'
                }),);
            });
            setTimeout(() => {
                console.log('settimeout')
                console.log('settimeout'+this.showForm)
                this.showForm=true;
           // this.formAppraisal = true;
            },200);
    }

    handleRowSelection(event) {
        this.mandKpis = JSON.parse(JSON.stringify(this.mandKpis));
        // to get Category
        let catTable = event.currentTarget.dataset.category;
        this.selectedKpiIds = this.init_selectedKPIs;
       console.log('----this.selectedKpiIds---->' + this.selectedKpiIds);
        //Selected KPIs of the Category
        const selectedRows = event.detail.selectedRows;
        let newKpiIds = selectedRows.map(kpi => kpi.Id);
        let index = this.selectedKPIMap.findIndex(kpi => kpi.category == catTable);
        if (index < 0) {
            let selKPI = {
                "category": catTable,
                "kpis": selectedRows,
            };
            this.selectedKPIMap = [...this.selectedKPIMap, selKPI];
        } else {
            this.selectedKPIMap[index].kpis = selectedRows;
        }
        this.selectedKPIMap = JSON.parse(JSON.stringify(this.selectedKPIMap));

        let catMandKpis = this.mandKpis.find(cat => cat.category == catTable);
        let catMandKpiIds = catMandKpis.kpis.map(kpi => kpi.Id);
        console.log('------catMandKpiIds----->', catMandKpiIds);
        let tempKPIs = [];
        tempKPIs = [...this.selectedKpiIds, ...newKpiIds];
        this.selectedKpiIds = [...new Set(tempKPIs)];
        if (index >= 0) {
            let maptemp = [...catMandKpiIds, ...newKpiIds];
            maptemp = [...new Set(maptemp)];
            this.selectedKPIMap[index].kpis = this.functionalData[index].value.filter(kpi => maptemp.includes(kpi.Id));
        }

        if (this.selectedKPIMap) {
            this.selectedKPIMap.forEach(selKpi => {
                if (selKpi.category !== catTable) {
                    let temp = selKpi.kpis.map(kpi => kpi.Id);
                    if (temp) {
                        temp = [...this.selectedKpiIds, ...temp];
                        this.selectedKpiIds = [...new Set(temp)];
                    }
                }
            })
        }
        console.log('-----selectedKPIMap----->', this.selectedKPIMap);
    }

   
    childToHome() {
        console.log('childtohome');
        this.fillAppraisal = false;
        this.getAppraiseDetails();
        this.home = true;
        this.formAppraisal = false;
        this.initiatePage = false;
        this.showForm = false;
        this.selectedKpiIds = [];
        this.mandKpis = [];
        this.savedKPIdata = [];
        this.selectedKPIMap1 = [];
        this.mandKpis1 = [];
        //     console.log(this.initiatePage);
        //     this.validateData();
        //    this.initiatePage=true;
        // getKpiDetails();

    }
    getTasksData() {
        //console.log('hi getTasksData' + this.evalRecordId);
        this.functionalData1 = [];
        /*getTaskList({evlId : this.evalRecordId})
        .then(result=>{
            
            this.taskDetails=result;
        
            if(this.taskDetails.length>0){
                
                this.showForm=true;
            }
        })*/
        // console.log('---getTasksData--->');
        // console.log(this.selectedRole);
        // console.log(this.selectedStatus);
        getKpiList({ evlId: this.evalRecordId, userRole :this.selectedRole, status:this.selectedStatus })
            .then(result => {

                this.functionalData1 = result;
                // console.log(' this.functionalData1'+JSON.stringify(this.functionalData1))
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
                            ele.FieldValue = kpi[ele.FieldAPI__c]?kpi[ele.FieldAPI__c]:null;
                        });

                    });

                    // Check if the category's masterKPIId already exists in this.mandKpis

                    tempMand.kpis = kpis;
                    this.mandKpis1 = [...this.mandKpis1, tempMand];
                })




                this.selectedKPIMap1 = this.mandKpis1;
                this.savedKPIdata = this.selectedKPIMap1;

                console.log('------this.selectedKPIMap1----', this.savedKPIdata);
                console.log('  this.showForm' + this.showForm);
                if (this.savedKPIdata.length) {

                    this.showForm = true;
                    console.log('  this.showForm' + this.showForm);
                }
                else{
                    this.showForm = false;
                }
            })

    }

    displayDynamicFields() {
        console.log('Entered into displayDynamicFields ');
        console.log(this.selectedStatus);
        getKPICustomMetadata({ userRole: this.selectedRole, status: this.selectedStatus })
        .then((result) => {
            this.metadataList = result;
            console.log('this.metadataList ',this.metadataList);
        })
        .catch((error) => {
            console.log('inside metadata catch error',error.message);
        });
    }
    handleFinal(){
        //alert('handleFinal');
        this.validateData(this.evalRecordId);
    }
}