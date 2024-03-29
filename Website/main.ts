/// <reference path="references.ts" />

import Point = CanvasHandler.Point;
import PointInterface = CanvasHandler.PointInterface;
import DataPointInterface = CanvasHandler.DataPointInterface;
import DataPointListInterface = CanvasHandler.DataPointListInterface;
import RectangleInterface = CanvasHandler.RectangleInterface;
import Rectangle = CanvasHandler.Rectangle;
import DataPointList = CanvasHandler.DataPointList;
import DataPointValueInterface = CanvasHandler.DataPointValueInterface;

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

const COLOR_RED: string = '#E03428';
const COLOR_BLUE: string = '#2887E0';
const COLOR_INDICATOR: string = '#ff4d57';
const COLOR_INDICATOR_INACTIVE: string = '#a0a0a0';
const COLOR_BACKGROUND: string = '#f9f9f9';
const COLOR_BLACK: string = '#232323';
const COLOR_WHITE: string = '#ffffff';
const COLOR_TRACKING_AREA: string = '#f3f3f3';

//let trackingArea: RectangleInterface = new Rectangle(-400, -300, 2200, 600);
let trackingArea: RectangleInterface = new Rectangle(-200, -200, 400, 400);
let viewport: RectangleInterface;

let nodes: Array<PointInterface> = [new Point(-210, -210), new Point(-210, 210)];
let magnifier: number = 1;
let offset: PointInterface = new Point(0, 0);

let test = [];
let test2 = [];

for (let x = 0; x < 1000; x+= 4){
    test.push({point: new Point(x, -0.0005*Math.pow(x, 2) + 0.65*x + 20), dataPointValue: {velocity: 10/((x/100)+1), spin: 2}, timestamp: x*10});
}

let dataPointList: Array<DataPointList> = [];

/*let point1: PointInterface = new Point(trackingArea.x + trackingArea.width*0.1, trackingArea.y + Math.random()*trackingArea.height);
let point2: PointInterface = new Point(trackingArea.x + trackingArea.width*0.5, trackingArea.y + Math.random()*trackingArea.height);
let point3: PointInterface = new Point(trackingArea.x + trackingArea.width*0.9, trackingArea.y + Math.random()*trackingArea.height);
let cubic: {a, b, c} = cubicFunction(point1, point2, point3);

let delta = trackingArea.width/1000;
for (let x = 0; x < 1000; x++){
    let value = x*delta + trackingArea.x;
    test2.push({point: new Point(value, cubic.a*Math.pow(value, 2) + cubic.b*value + cubic.c + (Math.random()-0.5)), dataPointValue: {velocity: 3-(10/((x/100)+1)), spin: 2}, timestamp: x*10});
}

let dataPointList: Array<DataPointList> = [new DataPointList('Attempt 1', test2, true, true, '#ffa730', 0)];

let dataPointList: Array<DataPointListInterface> = [
    new DataPointList('Attempt 1',
        test, true, true, '#ffa21d', 0),
    new DataPointList('Attempt 2',
        [
            {point: new Point(1000, 110), dataPointValue: {velocity: 10, spin: 2}, timestamp: 0},
            {point: new Point(900, 85), dataPointValue: {velocity: 9, spin: 1}, timestamp: 1000},
            {point: new Point(800, 70), dataPointValue: {velocity: 8, spin: 1}, timestamp: 2000},
            {point: new Point(700, 40), dataPointValue: {velocity: 7, spin: 1}, timestamp: 3000},
            {point: new Point(600, 30), dataPointValue: {velocity: 6, spin: 1}, timestamp: 4000},
            {point: new Point(500, 28), dataPointValue: {velocity: 5, spin: 1}, timestamp: 5000},
            {point: new Point(400, 28), dataPointValue: {velocity: 4, spin: 1}, timestamp: 6000},
            {point: new Point(300, 26), dataPointValue: {velocity: 3, spin: 1}, timestamp: 7000},
            {point: new Point(200, 26), dataPointValue: {velocity: 2, spin: 1}, timestamp: 8000},
            {point: new Point(50, 25), dataPointValue: {velocity: 1, spin: 0}, timestamp: 9000}
        ], true, true, '#7dfcff', 0),
    new DataPointList('Attempt 3',
        [
            {point: new Point(1000, 110), dataPointValue: {velocity: 3, spin: 2}, timestamp: 0},
            {point: new Point(900, 90), dataPointValue: {velocity: 2, spin: 1}, timestamp: 1000},
            {point: new Point(800, 75), dataPointValue: {velocity: 2, spin: 1}, timestamp: 2000},
            {point: new Point(700, 45), dataPointValue: {velocity: 2, spin: 1}, timestamp: 3000},
            {point: new Point(600, 35), dataPointValue: {velocity: 2, spin: 1}, timestamp: 4000},
            {point: new Point(500, 25), dataPointValue: {velocity: 2, spin: 1}, timestamp: 5000},
            {point: new Point(400, 30), dataPointValue: {velocity: 2, spin: 1}, timestamp: 6000},
            {point: new Point(300, 35), dataPointValue: {velocity: 2, spin: 1}, timestamp: 7000},
            {point: new Point(200, 40), dataPointValue: {velocity: 2, spin: 1}, timestamp: 8000},
            {point: new Point(100, 45), dataPointValue: {velocity: 0, spin: 0}, timestamp: 9000}
        ], true, true, '#fb80ff', 0),
    new DataPointList('Attempt 4',
        [
            {point: new Point(1000, 100), dataPointValue: {velocity: 3, spin: 2}, timestamp: 0},
            {point: new Point(900, 90), dataPointValue: {velocity: 2, spin: 1}, timestamp: 1000},
            {point: new Point(800, 80), dataPointValue: {velocity: 2, spin: 1}, timestamp: 2000},
            {point: new Point(700, 50), dataPointValue: {velocity: 2, spin: 1}, timestamp: 3000},
            {point: new Point(600, 40), dataPointValue: {velocity: 2, spin: 1}, timestamp: 4000},
            {point: new Point(500, 30), dataPointValue: {velocity: 2, spin: 1}, timestamp: 5000},
            {point: new Point(400, 40), dataPointValue: {velocity: 2, spin: 1}, timestamp: 6000},
            {point: new Point(300, 45), dataPointValue: {velocity: 2, spin: 1}, timestamp: 7000},
            {point: new Point(200, 47), dataPointValue: {velocity: 2, spin: 1}, timestamp: 8000},
            {point: new Point(100, 50), dataPointValue: {velocity: 0, spin: 0}, timestamp: 9000}
        ], true, true, '#ff4652', 0)];
*/

let currentDataPoint: DataPointListInterface | null = null;
let dataPointMouseAverage: PointInterface | null = null;

let currentHoverIndex: number | null = null;
let currentSelectedIndex: Array<number> = [];
let currentMousePosition: PointInterface | null = null;

let tracking: boolean = false;
let dataPointThreshold: number = 1;

let uniqueColor = colorGenerator();

let follow: boolean = false;
let fitToScreen: boolean = false;
const fitToScreenThreshold = 2;

const indicatorThreshold: number = 10;
let zoomLimits: PointInterface = new Point(0.35, 20);
let scrollSpeed: number = 0.05;


let velocities: Array<number> = [];

window.onload = () => {
    canvas = document.getElementById('canvas') as HTMLCanvasElement;
    context = canvas.getContext('2d') as CanvasRenderingContext2D;

    //Creates the default viewport Rectangle that contains the rendering area.
    viewport = new Rectangle(0, 0, trackingArea.width, trackingArea.height);

    resizeCanvas();

    startFitToScreen();
    resizeViewport();

    updateCanvas();
};

window.onresize = () => {
    resizeCanvas();
    resizeViewport();
    startFitToScreen();
};

document.onwheel = (event) => {
    if (document.readyState === 'complete') {
        let deltaMagnifier = -scrollSpeed * event.deltaY;

        let canvasBound = canvas.getBoundingClientRect();
        let x = event.clientX - canvasBound.left;
        let y = event.clientY - canvasBound.top;

        if (zoomLimits.x < magnifier + deltaMagnifier && magnifier + deltaMagnifier < zoomLimits.y) {
            magnifier += deltaMagnifier;

            //Offsets the position of the viewport to emulate zoom towards mouse
            offset.x += trackingArea.width * deltaMagnifier * ((viewport.x - x) / viewport.width);
            offset.y += trackingArea.height * deltaMagnifier * ((viewport.y - y) / viewport.height);
        }

        resizeViewport();
    }
};

document.onmousedown = (event) => {
    currentMousePosition = new Point(event.x, event.y);
};

document.onmouseup = (event) => {
    // Updates current selected data point if mouse was not moved between click and release
    if(currentMousePosition.x == event.x && currentMousePosition.y == event.y){
        if(currentHoverIndex != null){
            if(event.shiftKey){
                if(!currentSelectedIndex.includes(currentHoverIndex)) {
                    currentSelectedIndex.push(currentHoverIndex)
                }else {
                    let index = currentSelectedIndex.indexOf(currentHoverIndex);
                    if (index !== -1)
                        currentSelectedIndex.splice(index, 1);
                }
            }else {
                currentSelectedIndex = [currentHoverIndex];
            }
        }else{
            currentSelectedIndex = [];
        }
    }
    currentMousePosition = null;
};

document.onmousemove = (event) => {
    if (document.readyState === 'complete') {
        let canvasBound = canvas.getBoundingClientRect();
        let x = event.clientX - canvasBound.left;
        let y = event.clientY - canvasBound.top;

        if (event.buttons == 1) {
            offset.x += event.movementX;
            offset.y += event.movementY;
            stopFollow();
            resizeViewport();
        }

        //Translates mouse position from viewport to trackingArea coordinate system
        let mousePosition: PointInterface = new Point(x, y).getTranslated(viewport, trackingArea);

        //Gets closest dataPoint from any visible and active dataPoint lists
        let closestDistance: number;
        let closestDataPoint: DataPointListInterface;
        let currentIndex: number;

        for (let i = 0; i < dataPointList.length; i++) {
            if (dataPointList[i].active && dataPointList[i].show && dataPointList[i].dataPoints.length > 0) {
                let closest = dataPointList[i].getClosest(mousePosition.x, mousePosition.y);
                let distance = closest.point.distance(mousePosition);
                if (closestDistance == undefined || distance < closestDistance) {
                    closestDistance = distance;
                    closestDataPoint = new DataPointList(dataPointList[i].name, [closest], true, true, dataPointList[i].color, Date.now());
                    currentIndex = i;
                }
            }
        }
        if (closestDataPoint != undefined && closestDataPoint.dataPoints[0].point.distance(mousePosition) < indicatorThreshold) {
            currentDataPoint = closestDataPoint;
            dataPointMouseAverage = new Point(mousePosition.x + (closestDataPoint.dataPoints[0].point.x - mousePosition.x) / 2, mousePosition.y + (closestDataPoint.dataPoints[0].point.y - mousePosition.y) / 2);
            currentHoverIndex = currentIndex;
        } else {
            currentDataPoint = null;
            dataPointMouseAverage = null;
            currentHoverIndex = null;
        }
    }
};

function resizeCanvas(){
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}

function resizeViewport(){
    viewport = new Rectangle(offset.x, offset.y, trackingArea.width * magnifier, trackingArea.height * magnifier);
}

function updateCanvas(){
    if(fitToScreen || follow){
        let distance = updateFitToScreen();
        if(Math.abs(distance.x) < fitToScreenThreshold
            && Math.abs(distance.y) < fitToScreenThreshold
            && Math.abs(distance.magnifier) < fitToScreenThreshold/100){
            fitToScreen = false;
        }
        resizeViewport();
    }

    context.fillStyle = COLOR_TRACKING_AREA;
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawCourt();

    //Fill everything except tracking area
    context.fillStyle = COLOR_BACKGROUND;
    context.fillRect(0, 0, viewport.x, canvas.height);
    context.fillRect(viewport.x + viewport.width, 0, canvas.width - (viewport.x + viewport.width), canvas.height);
    context.fillRect(viewport.x, 0, viewport.width, viewport.y);
    context.fillRect(viewport.x, viewport.y + viewport.height, viewport.width, canvas.height - (viewport.y + viewport.height));

    drawDataPoints();

    if(tracking) {
        handleNetworkData();
    }
    drawNodes();

    drawStone();
    drawDataBox();

    window.requestAnimationFrame(updateCanvas);
}

function newTrack(){
    if(tracking){
        stopTrack();
    }
    tracking = true;

    let generatedHue = uniqueColor.next().value;
    let currentTrack: DataPointListInterface = new DataPointList(getName(), [], true, true, `hsl(${generatedHue}, 100%, 65%)`, Date.now());
    dataPointList.push(currentTrack);
    currentSelectedIndex.push(dataPointList.length-1);
}

function stopTrack(){
    tracking = false;
}

function cancelTrack(){
    if(tracking && confirm('Do you wish to stop tracking without saving?')) {
        tracking = false;
        dataPointList.pop();
    }
}

function getName(){
    return `Attempt ${String(dataPointList.length + 1)}`;
}

function* colorGenerator(){
    while(true) {
        // Random number between 0 and 255
        let value: number = Math.floor(Math.random() * Math.floor(255));
        yield value % 256;
        value += 128;
        for (let i = 0; i < 4; i++) {
            let subdivisions = Math.pow(2, i);
            for (let j = 0; j < subdivisions; j++) {
                value += 256 / subdivisions;
                yield value % 256;
            }
            value += 256 / (4 * subdivisions);
        }
    }
}

function startFitToScreen(shouldFollow: boolean = false){
    fitToScreen = true;
    if(!follow) {
        follow = shouldFollow;
    }
}

function stopFollow(){
    fitToScreen = false;
    follow = false;
}

function updateFitToScreen() {
    // Scales screen to fit the height of tracking area. Recenter to track if available, center of left goal otherwise
    let position: PointInterface = new Point(0, 0);

    if (Network.networkData != null && Network.networkData['position'] != null) {
        position.x = Network.networkData['position'].x;
    }

    const interpolationFactor: number = 0.2;

    let finalOffset = {x: canvas.width / 2 - (position.x - trackingArea.x) * magnifier,
                       y: canvas.height / 2 - (position.y - trackingArea.y) * magnifier,
                       magnifier: canvas.height*0.75/trackingArea.height};
    let distance = {x: offset.x - finalOffset.x, y: offset.y - finalOffset.y, magnifier: magnifier - finalOffset.magnifier};

    offset.x -= distance.x * interpolationFactor;
    if(fitToScreen) {
        let deltaMagnifier = -distance.magnifier * interpolationFactor;
        offset.y -= distance.y * interpolationFactor;
        magnifier += deltaMagnifier;

        // Offsets to compensate for the fact that magnifier scales from top left corner
        offset.x += deltaMagnifier * trackingArea.x;
        offset.y += deltaMagnifier * trackingArea.y;
    }

    return distance;
}

function handleNetworkData(){
    // Adds currently tracked position to data points if distance is lower than threshold
    if (Network.networkData != null && tracking) {
        let currentDataPointList = dataPointList[dataPointList.length - 1].dataPoints;

        const position = new Point(Network.networkData['position'].x, Network.networkData['position'].y);

        //const data: DataPointValueInterface = Network.networkData['data'];
        if (dataPointList[dataPointList.length - 1 ].dataPoints.length > 1){
            let dataPoints = dataPointList[dataPointList.length-1].dataPoints;
            let deltaTime: number = dataPoints[dataPoints.length - 1].timestamp - dataPoints[dataPoints.length - 2].timestamp;
            let distance: number = dataPoints[dataPoints.length-1].point.distance(dataPoints[dataPoints.length-2].point);
            velocities.push(distance*10/ deltaTime);
            if (velocities.length > 10){
                velocities.shift();
            }
        }

        let sum = 0;
        for( let i = 0; i < velocities.length; i++ ){
            sum += velocities[i]
        }
        let velocity = sum/velocities.length;
        const data: DataPointValueInterface = {velocity: velocity, spin: 0};
        dataPointList[dataPointList.length-1].dataPoints.push({point: position, dataPointValue: data, timestamp: Date.now()} as DataPointInterface)

        /*let oldDataPoints: Array<DataPointInterface> = dataPointList[dataPointList.length-1].dataPoints;
        let latestPoint: PointInterface;
        if(oldDataPoints.length > 0) {
            latestPoint = oldDataPoints[oldDataPoints.length - 1].point;
        }
        if(latestPoint == undefined || latestPoint.distance(position) > dataPointThreshold){
            dataPointList[dataPointList.length-1].dataPoints.push({point: position, dataPointValue: data, timestamp: Date.now()} as DataPointInterface)
        }*/
    }
}

function drawCourt(){
    //drawLine(new Point(-183, -250), new Point(-183, 250), COLOR_BLACK);
    drawLine(new Point(3658, -250), new Point(3658, 250), COLOR_BLACK);

    drawEllipse(new Point(0, 0), 183, COLOR_BLUE);
    drawEllipse(new Point(0, 0), 122, COLOR_WHITE);
    drawEllipse(new Point(0, 0), 61, COLOR_RED);

    drawEllipse(new Point(3475, 0), 183, COLOR_BLUE);
    drawEllipse(new Point(3475, 0), 122, COLOR_WHITE);
    drawEllipse(new Point(3475, 0), 61, COLOR_RED);

    drawLine(new Point(-336, 0), new Point(640, 0), COLOR_BLACK);
    drawLine(new Point(0, -250), new Point(0, 250), COLOR_BLACK);
    drawLine(new Point(-336, -250), new Point(-336, 250), COLOR_BLACK);
    drawLine(new Point(640, -250), new Point(640, 250), COLOR_BLACK);

    drawLine(new Point(3811, 0), new Point(2835, 0), COLOR_BLACK);
    drawLine(new Point(3475, -250), new Point(3475, 250), COLOR_BLACK);
    drawLine(new Point(3811, -250), new Point(3811, 250), COLOR_BLACK);
    drawLine(new Point(2835, -250), new Point(2835, 250), COLOR_BLACK);

    drawLine(new Point(-336, -250), new Point(3811, -250), COLOR_BLACK);
    drawLine(new Point(-336, 250), new Point(3811, 250), COLOR_BLACK);

    drawEllipse(new Point(0, 0), 15, COLOR_WHITE);
    drawEllipse(new Point(3475, 0), 15, COLOR_WHITE);
}

function drawNodes(){
    for(let node of nodes){
        drawPoint(node, 10, '#afafaf');
    }
}

function drawStone(color: string = COLOR_RED){
    if(Network.networkData != null && Network.networkData['position'] != null){
        let point: PointInterface = new Point(Network.networkData['position'].x, Network.networkData['position'].y);
        drawEllipse(point, 14.5, COLOR_INDICATOR_INACTIVE);
        drawEllipse(point, 12, color);
    }
}

function drawDataPoints(){
    for (let dataPoint of dataPointList){
        let color = dataPoint.color;
        if (dataPoint.active == false)
            color = COLOR_INDICATOR_INACTIVE;
        if (dataPoint.show) {
            for (let i = 0; i < dataPoint.dataPoints.length - 1; i++) {
                drawLine(dataPoint.dataPoints[i].point, dataPoint.dataPoints[i + 1].point, color, 4);
                drawPoint(dataPoint.dataPoints[i].point, 2, color);
            }
        }
    }
}

function drawDataBox(){
    if (currentDataPoint != null) {
        let dataPoint = currentDataPoint.dataPoints[0];
        let color = currentDataPoint.color;

        drawPoint(dataPoint.point, 4, color);
        const velocity = `Velocity: ${Math.round(dataPoint.dataPointValue.velocity*100)/100} m/s`;
        const spin = `Spin: ${dataPoint.dataPointValue.spin/50} rpm`;
        //const velocity = 'Velocity: No Data';
        //const spin = 'Spin: No Data';
        drawTextBox(dataPointMouseAverage, `${velocity}\n${spin}`);
    }
}

function drawEllipse(point: PointInterface, radius: number, color: string){
    let scale: PointInterface = trackingArea.getRatio(viewport);
    let translatedPoint: PointInterface = point.getTranslated(trackingArea, viewport);

    context.beginPath();
    context.ellipse(translatedPoint.x, translatedPoint.y, radius * scale.x, radius * scale.y, 0, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
}

function drawLine (start: PointInterface, end: PointInterface, color: string, width: number = 1){
    let translatedStart = start.getTranslated(trackingArea, viewport);
    let translatedEnd = end.getTranslated(trackingArea, viewport);

    context.beginPath();
    context.moveTo(translatedStart.x, translatedStart.y);
    context.lineTo(translatedEnd.x, translatedEnd.y);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.stroke();
}

function drawPoint(point: PointInterface, radius: number, color: string) {
    let translatedPoint: PointInterface = point.getTranslated(trackingArea, viewport);

    context.beginPath();
    context.arc(translatedPoint.x, translatedPoint.y, radius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
}

function drawTextBox(point: PointInterface, text){
    let translatedPoint: PointInterface = point.getTranslated(trackingArea, viewport);

    let name = currentDataPoint.name;
    let color = currentDataPoint.color;

    const lineHeight = 20;
    let lines: string = text.split('\n');
    let box: RectangleInterface = new Rectangle(translatedPoint.x, translatedPoint.y, 150, lineHeight*4);
    box.y -= box.height;

    context.fillStyle = COLOR_WHITE;
    context.fillRect(box.x, box.y, box.width, box.height);

    context.beginPath();
    context.fillStyle = color;
    context.arc(box.x + box.width*0.05, box.y + box.width*0.05, 5, 0, 2 * Math.PI);
    context.fill();

    context.font = 'bold 18px Arial';
    context.fillStyle = '#545454';
    context.fillText(name, box.x + box.width*0.15, box.y + box.width*0.1);

    context.beginPath();
    context.moveTo(box.x + box.width*0.1, box.y + box.width*0.12);
    context.lineTo(box.x + 140, box.y + box.width*0.12);
    context.strokeStyle = '#545454';
    context.lineWidth = 2;
    context.stroke();

    for(let line = 0; line < lines.length; line++) {
        context.font = '16px Arial';
        context.fillStyle = COLOR_BLACK;
        context.fillText(lines[line], translatedPoint.x + box.width*0.05, translatedPoint.y - 2*lineHeight + (line*lineHeight));
    }
}

function focusDataPointList(index: number){
    let count = 0;
    for (let i = 0; i < dataPointList.length; i++){
        if (dataPointList[i].active) {
            count += 1;
        }
    }
    for(let i = 0; i < dataPointList.length; i++){
        if (dataPointList[index].active && count == 1){
            dataPointList[i].active = true;
        }else{
            dataPointList[i].active = index == i;
        }
    }
}

function deleteDataPointList(index: number){
    currentSelectedIndex = [];
    stopTrack();
    dataPointList.splice(index, 1);
}

function cubicFunction(point1, point2, point3){
    let a = (-point1.x*point2.y + point1.x*point3.y + point2.x*point1.y - point2.x*point3.y - point3.x*point1.y + point3.x*point2.y)/
        (Math.pow(point1.x, 2)*point2.x - Math.pow(point1.x, 2)*point3.x - point1.x*Math.pow(point2.x, 2) + point1.x*Math.pow(point3.x, 2) + Math.pow(point2.x, 2)*point3.x - point2.x*Math.pow(point3.x, 2));

    let b = (Math.pow(point1.x, 2)*point2.y - Math.pow(point1.x, 2)*point3.y - Math.pow(point2.x, 2)*point1.y + Math.pow(point2.x, 2)*point3.y + Math.pow(point3.x, 2)*point1.y - Math.pow(point3.x, 2)*point2.y)/
        (Math.pow(point1.x, 2)*point2.x - Math.pow(point1.x, 2)*point3.x - point1.x*Math.pow(point2.x, 2) + point1.x*Math.pow(point3.x, 2) + Math.pow(point2.x, 2)*point3.x - point2.x*Math.pow(point3.x, 2));

    let c = (Math.pow(point1.x, 2)*point2.x*point3.y - Math.pow(point1.x, 2)*point3.x*point2.y - point1.x*Math.pow(point2.x, 2)*point3.y + point1.x*Math.pow(point3.x, 2)*point2.y + Math.pow(point2.x, 2)*point3.x*point1.y - point2.x*Math.pow(point3.x, 2)*point1.y)/
        (Math.pow(point1.x, 2)*point2.x - Math.pow(point1.x, 2)*point3.x - point1.x*Math.pow(point2.x, 2) + point1.x*Math.pow(point3.x, 2) + Math.pow(point2.x, 2)*point3.x - point2.x*Math.pow(point3.x, 2))

    return {a:a, b:b, c:c}
}

function getTrajectory(){
    let point1: PointInterface = new Point(trackingArea.x + trackingArea.width*0.1, trackingArea.y + Math.random()*trackingArea.height);
    let point2: PointInterface = new Point(trackingArea.x + trackingArea.width*0.5, trackingArea.y + Math.random()*trackingArea.height);
    let point3: PointInterface = new Point(trackingArea.x + trackingArea.width*0.9, trackingArea.y + Math.random()*trackingArea.height);
    let cubic: {a, b, c} = cubicFunction(point1, point2, point3);

    let delta = trackingArea.width/1000;
    for (let x = 0; x < 1000; x++){
        let value = x*delta + trackingArea.x;
        //test2.push({point: new Point(value, cubic.a*Math.pow(value, 2) + cubic.b*value + cubic.c), dataPointValue: {velocity: 10/((x/100)+1), spin: 2}, timestamp: x*10});
    }
}