/// <reference path="references.ts" />

import Point = CanvasHandler.Point;
import PointInterface = CanvasHandler.PointInterface;
import DataPointListInterface = CanvasHandler.DataPointListInterface;
import RectangleInterface = CanvasHandler.RectangleInterface;
import Rectangle = CanvasHandler.Rectangle;
import DataPointList = CanvasHandler.DataPointList;

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

const COLOR_RED: string = '#E03428';
const COLOR_BLUE: string = '#2887E0';
const COLOR_INDICATOR_INACTIVE: string = '#a0a0a0';
const COLOR_BACKGROUND: string = '#f9f9f9';
const COLOR_BLACK: string = '#232323';
const COLOR_WHITE: string = '#ffffff';
const COLOR_TRACKING_AREA: string = '#f3f3f3';

let trackingArea: RectangleInterface = new Rectangle(-400, -300, 1800, 600);
let viewport: RectangleInterface;
let magnifier: number = 1;
let offset: PointInterface = new Point(0, 0);

let test = [];
for (let x = 0; x < 1000; x+= 4){
    test.push({point: new Point(x, -0.0005*Math.pow(x, 2) + 0.65*x + 20), dataPointValue: {velocity: 3, spin: 2}});
}
console.log(test);

let dataPointList: Array<DataPointListInterface> = [
    new DataPointList('Attempt 1',
        test, true, true, '#ffa21d'),
    new DataPointList('Attempt 2',
        [
            {point: new Point(1000, 110), dataPointValue: {velocity: 3, spin: 2}},
            {point: new Point(900, 85), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(800, 70), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(700, 40), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(600, 30), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(500, 28), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(400, 28), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(300, 26), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(200, 26), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(50, 25), dataPointValue: {velocity: 0, spin: 0}}
        ], true, true, '#7dfcff'),
    new DataPointList('Attempt 3',
        [
            {point: new Point(1000, 110), dataPointValue: {velocity: 3, spin: 2}},
            {point: new Point(900, 90), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(800, 75), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(700, 45), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(600, 35), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(500, 25), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(400, 30), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(300, 35), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(200, 40), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(100, 45), dataPointValue: {velocity: 0, spin: 0}}
        ], true, true, '#fb80ff'),
    new DataPointList('Attempt 4',
        [
            {point: new Point(1000, 100), dataPointValue: {velocity: 3, spin: 2}},
            {point: new Point(900, 90), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(800, 80), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(700, 50), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(600, 40), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(500, 30), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(400, 40), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(300, 45), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(200, 47), dataPointValue: {velocity: 2, spin: 1}},
            {point: new Point(100, 50), dataPointValue: {velocity: 0, spin: 0}}
        ], true, true, '#ff4652')];

let currentDataPoint: DataPointListInterface | null = null;
let dataPointMouseAverage: PointInterface | null = null;

let indicatorThreshold: number = 100;
let zoomLimits: PointInterface = new Point(0.35, 20);
let scrollSpeed: number = 0.05;

window.onload = () => {
    canvas = document.getElementById('canvas') as HTMLCanvasElement;
    context = canvas.getContext('2d') as CanvasRenderingContext2D;

    //Creates the default viewport Rectangle that contains the rendering area.
    viewport = new Rectangle(0, 0, trackingArea.width, trackingArea.height);

    resizeCanvas();
    updateCanvas();
};

window.onresize = () => {
    resizeCanvas();
};

document.onwheel = (event) => {
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

    resizeCanvas();
};

document.onmousemove = (event) => {
    let canvasBound = canvas.getBoundingClientRect();
    let x = event.clientX - canvasBound.left;
    let y = event.clientY - canvasBound.top;

    if (event.buttons == 1) {
        offset.x += event.movementX;
        offset.y += event.movementY;
        resizeCanvas();
    }

    //Translates mouse position from viewport to trackingArea coordinate system
    let mousePosition: PointInterface = new Point(x, y).getTranslated(viewport, trackingArea);

    //Gets closest dataPoint from any visible and active dataPoint lists
    let closestDistance: number;
    let closestDataPoint: DataPointListInterface;
    for (let dataPoints of dataPointList) {
        if (dataPoints.active && dataPoints.show) {
            let closest = dataPoints.getClosest(mousePosition.x, mousePosition.y);
            let distance = closest.point.distance(mousePosition);
            if (closestDistance == undefined || distance < closestDistance) {
                closestDistance = distance;
                closestDataPoint = new DataPointList(dataPoints.name, [closest], true, true, dataPoints.color);
            }
        }
    }
    if (closestDataPoint != undefined && closestDataPoint.dataPoints[0].point.distance(mousePosition) < indicatorThreshold) {
        currentDataPoint = closestDataPoint;
        dataPointMouseAverage = new Point(mousePosition.x + (closestDataPoint.dataPoints[0].point.x - mousePosition.x) / 2, mousePosition.y + (closestDataPoint.dataPoints[0].point.y - mousePosition.y) / 2)
    }else {
        currentDataPoint = null;
        dataPointMouseAverage = null;
    }
};

function resizeCanvas(){
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    viewport = new Rectangle(offset.x, offset.y, trackingArea.width * magnifier, trackingArea.height * magnifier);
}

function updateCanvas(){
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

    if (Network.networkData != null) {
        const position = new Point(Network.networkData['position'].x, Network.networkData['position'].y);
        drawPoint(position, 3, COLOR_BLACK);
    }

    window.requestAnimationFrame(updateCanvas);
}

function drawCourt(){
    drawLine(new Point(-183, -250), new Point(-183, 250), COLOR_BLACK);
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

function drawStone(){
    drawEllipse(new Point(300, 150), 14.5, COLOR_INDICATOR_INACTIVE);
    drawEllipse(new Point(300, 150), 12, COLOR_RED);
}

function drawDataPoints(){
    for (let dataPoints of dataPointList) {
        let color = dataPoints.color;
        if (dataPoints.active == false)
            color = COLOR_INDICATOR_INACTIVE;
        if (dataPoints.show) {
            for (let i = 0; i < dataPoints.dataPoints.length - 1; i++) {
                drawLine(dataPoints.dataPoints[i].point, dataPoints.dataPoints[i + 1].point, color, 4);
                drawPoint(dataPoints.dataPoints[i].point, 2, color);
            }
        }
    }

    if (currentDataPoint != null) {
        let dataPoint = currentDataPoint.dataPoints[0];
        let color = currentDataPoint.color;

        drawPoint(dataPoint.point, 4, color);
        const velocity = `Velocity: ${dataPoint.dataPointValue.velocity}`;
        const spin = `Spin: ${dataPoint.dataPointValue.spin}`;
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

function hashString(string){
    let hash = 0, i, chr;
    if (string.length === 0) return hash;
    for (i = 0; i < string.length; i++) {
        chr   = string.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}