import { LightningElement, api, track } from 'lwc';
import getEmployeeinformaation from '@salesforce/apex/CCT_PmsPersonalDetailsController.getEmployeeinformaation';
import { getSessionParameter } from './sessionManager';
import myResource1 from '@salesforce/resourceUrl/loginbg';
import getEmployeeRecord from '@salesforce/apex/CCT_PMSReviewer.getEmployeeRecord';


export default class HomePage_pms extends LightningElement {

    @track email;
    @track employeeId;
    logingbg = myResource1;
    @track personalTemplate = false;
    @track appraisalTemplate = false;
    @track reviwerTemplate = false;
    @track feedbackTemplate = false;
    @track designation;
    @track band;
    employeeName;

    /*Added below variables for the role picklist functionality*/
    appraiser;
    reviewer;
    roleSelectedValue = 'appraisee';
    isAppraisee = true;
    appraisee = true;
    isAppraiser = false;
    isReviewer = false;
    isAppRev = false;
    @track activeSections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];


    get options() {
        if (this.reviewer > 0) {
            return [
                { label: 'Appraisee', value: 'appraisee' },
                { label: 'Appraiser', value: 'appraiser' },
                { label: 'Reviewer', value: 'reviewer' },
            ];
        } else if (this.appraiser > 0) {
            return [
                { label: 'Appraisee', value: 'appraisee' },
                { label: 'Appraiser', value: 'appraiser' },
            ];
        } else {
            return [
                { label: 'Appraisee', value: 'appraisee' },
            ];
        }
    }

    session = {
        userName: getSessionParameter('userName'),
        userRole: getSessionParameter('userRole'),
        userId: getSessionParameter('userId'),
        userDU: getSessionParameter('userDU'),
        userDUId: getSessionParameter('userDUId'),
        sessionid: getSessionParameter('sessionid'),
        managerEmail: getSessionParameter('managerEmail'),
        managerId: getSessionParameter('managerId')
    };
    constructor() {
        super();
        this.email = getSessionParameter('userName');
        console.log('userName----' + getSessionParameter('userName'));
        console.log('email----' + this.email);
        console.log('session----' + this.session);
        this.getEmployeeData();

    }

    // renderedCallback() {
    //     //do something
    //     console.log('Employee Id line 68 :- ' + this.employeeId);
    //     if(this.employeeId){
    //         this.getEmployeeRecord();
    //     }
    // }

    getEmployeeData() {
        console.log('this.session.userName' + this.session.userName)
        
        this.email=this.session.userName;
        console.log( ' this.email'+this.email)
        getEmployeeinformaation({ emailvalue: this.email })
            .then((result) => {
                console.log(result);
                console.log('my data' + JSON.stringify(result));
                this.employeeId = result.Id;
                console.log('Employee Id line 78 :- ' + this.employeeId);
                this.employeeRoleType = result.Role__c;
                this.designation = result.Designation__c;
                this.band = result.Band__c;
                this.employeeName = result.Name;
                if(this.employeeId){
                    this.getEmployeeRecord();
                }
                // this.employeeRole = result.Role__c == 'HR' ? true : false;
            })

    }
    handleActive(event) {
        if ('Home' == event.target.value) {
            if(this.isAppraisee == true){
                this.personalTemplate = true;
                this.isAppRev = false;
            } else if(this.isAppRev == true){
                this.personalTemplate = false;
                this.isAppRev = true;
            }
            this.appraisalTemplate = false;
            this.reviwerTemplate = false;
            this.feedbackTemplate = false;

        }
        else if ('Appraisals' == event.target.value) {
            //this.personalTemplate = false;
            if(this.isAppraisee == true){
                this.personalTemplate = true;
                this.isAppRev = false;
            } else if(this.isAppRev == true){
                this.personalTemplate = false;
                this.isAppRev = true;
            }
            this.appraisalTemplate = true;
            this.reviwerTemplate = false;
            this.feedbackTemplate = false;

        }
        else if ('Feedback' == event.target.value) {
            //this.personalTemplate = false;
            if(this.isAppraisee == true){
                this.personalTemplate = true;
                this.isAppRev = false;
            } else if(this.isAppRev == true){
                this.personalTemplate = false;
                this.isAppRev = true;
            }
            this.appraisalTemplate = true;
            this.reviwerTemplate = false;
            this.feedbackTemplate = true;

        }
        else if ('Reviewer' == event.target.value) {
            //this.personalTemplate = false;
            if(this.isAppraisee == true){
                this.personalTemplate = true;
                this.isAppRev = false;
            } else if(this.isAppRev == true){
                this.personalTemplate = false;
                this.isAppRev = true;
            }
            this.appraisalTemplate = false;
            this.reviwerTemplate = true;
            this.feedbackTemplate = false;

        }
    }

    //handleChange function handles the role picklist changes
    handleChange(event) {
        this.roleSelectedValue = event.detail.value;

        if (this.roleSelectedValue == "appraisee") {
            this.appraisee = true;
            this.isAppraiser = false;
            this.isReviewer = false;
            this.isAppRev = false;
            this.personalTemplate = true;
        } else if (this.roleSelectedValue == "appraiser") {
            this.appraisee = false;
            this.isAppraiser = true;
            this.isReviewer = false;
            this.isAppRev= true;
            this.personalTemplate = false;
        } else if (this.roleSelectedValue == "reviewer") {
            this.appraisee = false;
            this.isAppraiser = false;
            this.isReviewer = true;
            this.isAppRev= true;
            this.personalTemplate = false;
        }
    }

    // getEmployeeRecord function handles to fetch and check wheather the logged in employee has appriser and reviewer role
    getEmployeeRecord() {
        getEmployeeRecord({ employeeId: this.employeeId })
            .then(result => {
                console.log('getEmployeeRecord :- ');
                console.log(result);
                if(result && result.length > 0){
                    let emp = result[0];
                    console.log('emp---> ' + emp);
                    this.appraiser = emp?.Employee_Master1__r?.length;
                    this.reviewer = emp?.Employee_Master2__r?.length;
                    if (this.reviewer > 0) {
                        this.isAppraisee = false;
                    } else if (this.appraiser > 0) {
                        this.isAppraisee = false;
                    } else {
                        this.isAppraisee = true;
                    }
                    console.log('isAppraisee---> ' + this.isAppraisee);
                    console.log('appraiser---> ' + this.appraiser);
                    console.log('reviewer---> ' + this.reviewer);
                }                
            })
            .catch(error => {
                
                console.log('Error getting getEmployeeRecord : ' + JSON.stringify(error));
            })
    }
}