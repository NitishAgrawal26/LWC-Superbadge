import { LightningElement ,api , wire } from 'lwc';

// imports
import BOATMC  from '@salesforce/messageChannel/BoatMessageChannel__c';
import {MessageContext, publish} from 'lightning/messageService';  //may be not needed
const TILE_WRAPPER_SELECTED_CLASS  = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';

export default class BoatTile extends LightningElement {
    @api boat ={};
    @api selectedBoatId;
    @wire(MessageContext) messageBoatId;
    // Getter for dynamically setting the background image for the picture
    get backgroundStyle() { 
        return `background-image:url(${this.boat.Picture__c})`;
       
    }
    
    // Getter for dynamically setting the tile class based on whether the
    // current boat is selected
    get tileClass() { 
        if( this.selectedBoatId===this.boat.Id ){
            console.log('class to be set '+ TILE_WRAPPER_SELECTED_CLASS);
            return TILE_WRAPPER_SELECTED_CLASS
        }
        console.log('class to be set '+ TILE_WRAPPER_UNSELECTED_CLASS);
        return TILE_WRAPPER_UNSELECTED_CLASS;
    }
    
    // Fires event with the Id of the boat that has been selected.
    selectBoat() { 
        const boatId=this.boat.Id;
//        const selectTileEvent = new CustomEvent('boatselect',{detail:this.boat.Id})
        const selectTileEvent = new CustomEvent('boatselect',{detail:{boatId: this.boat.Id}})

        this.dispatchEvent(selectTileEvent);
        const messagePayload = {
            recordId:this.boat.Id
        }
        publish(this.messageBoatId,BOATMC, messagePayload );
    }
}
