/// <reference path="references.ts" />

module Network {
    export let networkData: string | null = null;

    try {
        let websocket: WebSocket = new WebSocket('ws://localhost:8765');

        websocket.onmessage = function (event) {
            networkData = JSON.parse(event.data);
        };
    }catch(err){
        console.log('No Anchors Connected...');
    }
}