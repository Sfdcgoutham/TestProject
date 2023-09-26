import { LightningElement, track, api } from 'lwc';
import submitTransferKpi from '@salesforce/apex/CCT_TransferKpi.submitTransferKpi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class Lct_TransferKpi extends LightningElement {
    showModal = false;
    @track selectedEmployee = '';
    @track selectedStatus = '';
    @api kpiRecordId;
    @track updatestatus=0;
  //  KpiStatus__c= 'KPI Transferred';
    showTransferKPI() {
        this.showModal = true;

    }
    handleEmployeeChange(event) {
        //  console.log(event.detail.id);
        this.selectedEmployee = event.detail.id;
    }
    closeModal() {
        this.showModal = false;
    }
    //  connectedCallback() {
    //     if (this.feedbackStatusPicklistValues.data) {
    //         const defaultPicklistValue = this.feedbackStatusPicklistValues.data.defaultValue;
    //         this.selectedStatus = defaultPicklistValue.value;
    //     }
    submitTransfer() {
        console.log('pass1:');
        let eleStr = this.template.querySelector('c-lct-_child-lookup');
        eleStr.isInputValid();
        if (this.isInputValid('validity') && eleStr.isInputValid()) {
            console.log('pass2:');
            submitTransferKpi({
                selectedEmployeeId: this.selectedEmployee,
                EmployeeId: this.employeeId,
                kpiRecordId: this.kpiRecordId,
            })

                .then(result => {
                    this.selectedEmployee = '';
                    
                    console.log('KPI Transferred successfully:', result);

                    // Show a success toast message
                    const toastEvent = new ShowToastEvent({
                        title: 'Success',
                        message: 'KPI Transferred successfully',
                        variant: 'success'
                    });
                    this.dispatchEvent(toastEvent);
                     this.dispatchEvent(new CustomEvent('updatestatus', {
                detail: this.updatestatus++
                
            
        }));
    
                    setTimeout(() => {
                        this.closeModal();
                    }, 500);

                })
                .catch(error => {

                    console.error('Error Transferring:', error);

                    // Show an error toast message
                    const toastEvent = new ShowToastEvent({
                        title: 'Error',
                        message: 'An error occurred while Transferring the KPI',
                        variant: 'error'
                    });
                    this.dispatchEvent(toastEvent);
                });

        }
        }
          isInputValid(res) {
        let name = '.' + res;
        let isValid = true;
        let inputFields = this.template.querySelectorAll(name);
        inputFields.forEach(inputField => {
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }
    

    }