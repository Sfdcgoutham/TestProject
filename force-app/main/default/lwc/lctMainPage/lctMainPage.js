import { LightningElement, api } from 'lwc';

export default class LctMainPage extends LightningElement {
    @api employeeId;
    @api email;
    @api selectedRole;
    @api isAppraisee;
    @api isAppraiser;
    @api isReviewer;
    @api selectedStatus;

    connectedCallback(){
        console.log(this.selectedRole);
        console.log(this.isAppraisee);
        console.log(this.isAppraiser);
        console.log(this.isReviewer);
    }
}