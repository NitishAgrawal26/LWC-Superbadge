import { LightningElement,api,wire,track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import{updateRecord } from 'lightning/uiRecordApi';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { publish, MessageContext } from 'lightning/messageService';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';
const columns = [
        {label:'Name',
        fieldName:'Name',
        Type:'text',
        editable: true},
        {label:'Lenght',
        fieldName:'Length__c',
        Type:'number',
        editable: true},
        {label:'Price',
        fieldName:'Price__c',
        Type:'currency',
        editable: true},
        {label:'Description',
        fieldName:'Description__c',
        Type:'text',
        editable: true}
    
]
export default class BoatSearchResults extends LightningElement {
    @track boats = {};
    columns = columns;
    selectedBoatId = '';
    boatTypeId = '';
    @track draftValues=[];
    isLoading = false;

        // wired message context
        @wire(MessageContext) messageContext;
        // wired getBoats method
    
    @wire(getBoats,{boatTypeId:'$boatTypeId'})

    wiredBoats({data,error}){
        console.log(this.boatTypeId + 'this is the selected boat type');
        if(data){
            this.boats = data;
            console.log('initial load successfull' + this.boats);
            this.notifyLoading(false);
        }
        else if(error){
            this.boats = undefined;
            console.log('initial load Unsuccessfull');
            this.notifyLoading(false);
        }
    }
    
    @api searchBoats(boatTypeId){   
        console.log('reached Child component with boattype ID' + boatTypeId);
        this.notifyLoading(true);
        this.boatTypeId = boatTypeId;
        
    }
// Logic to set the Lightning Message channel for selected boat Id update
// this public function must refresh the boats asynchronously
 // uses notifyLoading
 @api async refresh() {
    this.notifyLoading(true);
    refreshApex(this.boats);
    this.notifyLoading(false);
  }

  // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) { 
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }

  // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId
    const recordPayload = {
        recordId: boatId
    };
    publish(this.messageContext,BOATMC,recordPayload);
    }

  // This method must save the changes in the Boat Editor
  // Show a toast message with the title
  // clear lightning-datatable draft values
    handleSave() {
    //this.notifyLoading(true);
    const recordInputs = event.detail.draftValues.slice().map(draft => {
        const fields = Object.assign({}, draft);
        return { fields };
    });
    const promises = recordInputs.map(recordInput =>{
        updateRecord(recordInput);
    }
            //update boat record
        );
    Promise.all(promises)
        .then(() => {
            const successEvent = new ShowToastEvent({
                title: SUCCESS_TITLE ,
                message: MESSAGE_SHIP_IT,
                variant: SUCCESS_VARIANT
            })
            this.dispatchEvent(successEvent)
        })
        .catch(error => {
            const errorEvent = new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.body.message,
                variant: ERROR_VARIANT
            })
            this.dispatchEvent(errorEvent)
        })
        .finally(() => {
            draftValues = [];
            this.refresh();
            //this.notifyLoading(false);
        });
    }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) { 
        if(isLoading){
            const loadingEvent = new CustomEvent('loading');
            this.dispatchEvent(loadingEvent);   
        }
        else{
            const doneLoadingEvent = new CustomEvent('doneloading');
            this.dispatchEvent(doneLoadingEvent);
        }
    }
    }