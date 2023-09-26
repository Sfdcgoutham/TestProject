import { LightningElement, api, track,wire} from 'lwc';
import uploadfile from '@salesforce/apex/OneDriveIntegration.uploadFileContentsForPMS';
import getDownloadLink from '@salesforce/apex/OneDriveIntegration.getDownloadLink';
import getIndividualAppraisalRecord from '@salesforce/apex/CCT_PMSReviewer.getIndividualAppraisalRecord';
import getkpiStatusRecords from '@salesforce/apex/CCT_TransferKpi.getkpiStatusRecords';
import getAllAttachmentRecords from '@salesforce/apex/CCT_PmsPersonalDetailsController.getAllAttachmentRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

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

export default class LCT_FileUpload extends LightningElement {
    @api kpiRecordId;
    @api evalRecordId;
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;
    @api initiatedStatus;
    @api employeeId;
    columns = attachmentColumns;
    attachmentsData = [];
    showDownload = false;
    accLink;
    InputFileName = '';
    fileData;
    Sobjecttype = 'Task_Tracker__c';
    fileNames;
    uploadButtion = false;
 //   @track status;
    @track shouldShowTransferButton = false;
   @track kpiStatusValue ;

    connectedCallback() {
        console.log('----initiatedStatus---->');
        console.log(this.initiatedStatus);
        console.log(this.isAppraisee);
        if(this.initiatedStatus == 'Initiated'){
            this.uploadButtion = true;
        }
        console.log(this.kpiRecordId);
        this.getAppraisalRecord();
        if (this.initiatedStatus == 'Submitted' || this.initiatedStatus == 'Auto Submitted') {
            this.shouldShowTransferButton = true;
            console.log('entry');
        } else {
            this.shouldShowTransferButton = false;
        }
        this.fetchKpiStatus();
    }

    getKPIRecordId(event){
        console.log('KPI Id file upload', this.kpiRecordId);
        setTimeout(() => {
            getAllAttachmentRecords({kpiId : this.kpiRecordId} )
            .then(result => {
                this.attachmentsData = result;
                this.showDownload = true;
            })
            .catch(error => {
                console.log('Error getting getAllAttachmentRecords : ' + JSON.stringify(error));
            })
        }, 500);
    }

    openfileUpload(event) {
        this.kpiRecordId = event.currentTarget.dataset.kpiid;
        this.InputFileName = '';
        const file = event.target.files[0];
        var reader = new FileReader()
        reader.onload = () => {
            var fileContent = reader.result.split(',')[1];
            this.fileNames = file.name.split('.');
            let extn = this.fileNames[this.fileNames.length - 1];
            this.fileNames.pop();
            this.fileData = {
                'fileName': this.fileNames.join('.'),
                'fileExt': extn,
                'fileContent': fileContent,
                //'sObjectType': this.Sobjecttype,
                'folderName1' :this.appraisalCycle, 
                'folderName2' :this.appraisalName,
                'recordId': this.kpiRecordId
            }
            this.InputFileName = this.fileNames.join('.');
        }
        reader.readAsDataURL(file)
    }

    handleuploaded() {
        const { fileContent, fileName, fileExt, folderName1, folderName2, recordId } = this.fileData
        uploadfile(
        {
            fileContent, fileName, fileExt, folderName1, folderName2, recordId
        })
        .then(result => {
            this.fileData = null
            let title = `${fileName} uploaded successfully!!`
            const toastEvent = new ShowToastEvent({
                title,
                variant: "success"
            })
            this.dispatchEvent(toastEvent)
        })
        .catch((error) => {
            console.log('eneter catch');
            console.log('==in error==' + JSON.stringify(error.message));
        });
    }

    appraisalName;
    appraisalCycle;
    getAppraisalRecord(){
        getIndividualAppraisalRecord({ recordId: this.evalRecordId })
        .then(result => {
            this.appraisalName = result?.Name;
            this.appraisalCycle = result?.AppraisalCycle__c;
        })
        .catch(error => {
            console.log('Error getting getAppraisalRecord : ' + error.message );
        })
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const attachmentId = event.detail.row.Id;
        switch (actionName) {
            case 'view':
                setTimeout(() => {
                    getDownloadLink({attachmentId : attachmentId})
                    .then(result => {
                        this.accLink = result;
                        window.open(this.accLink, "_blank");
                    })
                    .catch(error => {
                    console.log('Error getting getAllAttachmentRecords : ' + JSON.stringify(error));
                    })
                }, 500);
                break;
            default:
        }
    }
    // Kpi Status Field
   /*  @wire(getkpiStatusRecords, { evalRecordId:'$evalRecordId' ,updateStatus:'$message' })

    wiredStatus({ error, data }) {
        if (data) {
            console.log('dtaa'+data.KpiStatus__c);
            if(data.KpiStatus__c !=null){
                this.kpiStatusValue = data.KpiStatus__c;
            }
            else{
            this.kpiStatusValue = 'None';
            }
            console.log(employeeId);
        } else if (error) {
            // Handle the error here
        }
    }*/
    fetchKpiStatus() {
        console.log(this.kpiRecordId);
        getkpiStatusRecords({ kpiRecordId: this.kpiRecordId })
            .then(result => {
                console.log(result);
                if (result.KpiStatus__c != '') {
                    this.kpiStatusValue = result.KpiStatus__c;
                }
                else{
                    this.kpiStatusValue ='None';
                }
                console.log('data: ' + this.kpiStatusValue);
            })
            .catch(error => {
                // Handle the error here
                console.log(error);
            });
    }
  updateStatus(event) {
    this.message = event.detail;
}
}