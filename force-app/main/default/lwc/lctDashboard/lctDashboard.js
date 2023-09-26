import { LightningElement, api } from 'lwc';

export default class LctDashboard extends LightningElement {
    @api employeeId;
    @api email;
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;

    connectedCallback(){
        console.log('Employee Id :- '+this.employeeId);
    }
}