import { LightningElement,track,api } from 'lwc';
//import getTaskInfo from '@salesforce/apex/CCT_PmsPersonalDetailsController.getTaskInfo';


export default class LCT_requestedKpis extends LightningElement {
    @api tranferKpiId;
    @api evlRecordId;
   
    connectedCallback(){
        console.log(this.evlRecordId);
    //this.evalRecordId=this.evalRecordId;
    //this.tranferKpiId=this.kpiId;
    console.log(this.tranferKpiId);
    }
}