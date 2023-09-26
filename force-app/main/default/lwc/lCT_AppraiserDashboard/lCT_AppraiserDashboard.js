import { LightningElement, api } from 'lwc';

export default class LCT_AppraiserDashboard extends LightningElement {
    @api employeeId;
    @api email;
    @api selectedRole;

    connectedCallback(){
        console.log('Employee Id :- '+this.employeeId);
        console.log('Selected Role :- '+this.selectedRole);
    }
}