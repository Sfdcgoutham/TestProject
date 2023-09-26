import { LightningElement, api } from 'lwc';

export default class LCT_AppraiserMainPage extends LightningElement {
    @api employeeId;
    @api email;
    @api selectedRole;
}