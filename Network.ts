/// <reference path="references.ts" />

module Network {
    let websocket: WebSocket = new WebSocket('ws://localhost:8765');

    export let networkData: string | null = null;

    websocket.onmessage = function (event) {
        networkData = JSON.parse(event.data);
    };
}