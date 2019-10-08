/// <reference path="references.ts" />

import Point = CanvasHandler.Point;
import PointInterface = CanvasHandler.PointInterface;
import DataPointInterface = CanvasHandler.DataPointInterface;
import DataPointListInterface = CanvasHandler.DataPointListInterface;
import RectangleInterface = CanvasHandler.RectangleInterface;
import Rectangle = CanvasHandler.Rectangle;
import DataPointList = CanvasHandler.DataPointList;

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

const COLOR_RED: string = '#E03428';
const COLOR_BLUE: string = '#2887E0';
const COLOR_INDICATOR: string = 'rgb(255,128,127)';
const COLOR_INDICATOR_INACTIVE: string = '#a0a0a0';
const COLOR_BACKGROUND: string = '#f9f9f9';
const COLOR_BLACK: string = '#232323';
const COLOR_WHITE: string = '#ffffff';
const COLOR_TRACKING_AREA: string = '#f3f3f3';

let trackingArea: RectangleInterface = new Rectangle(-400, -300, 1800, 600);
let viewport: RectangleInterface;
let magnifier: number = 1;
let offset: PointInterface = new Point(0, 0);

let dataPointList: Array<DataPointListInterface> = [
    new DataPointList('Attempt 1',
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
        ], true, false, '#7dfcff'),
    new DataPointList('Attempt 2',
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
    new DataPointList('Attempt 3',
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
        ], false, true, COLOR_INDICATOR)]
;
let currentDataPoint: DataPointInterface | null = null;
let indicatorThreshold: number = 40;
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
    let closestDataPoint: DataPointInterface;
    for (let dataPoints of dataPointList) {
        if (dataPoints.active && dataPoints.show) {
            let closest = dataPoints.getClosest(mousePosition.x, mousePosition.y);
            let distance = closest.point.distance(mousePosition);
            if (closestDistance == undefined || distance < closestDistance) {
                closestDistance = distance;
                closestDataPoint = closest;
            }
        }
    }
    if (closestDataPoint.point.distance(mousePosition) < indicatorThreshold)
        currentDataPoint = closestDataPoint;
    else
        currentDataPoint = null;
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

    drawDataPoints();
    if (currentDataPoint != null) {
        drawPoint(currentDataPoint.point, 3, COLOR_BLACK);
        const velocity = `Velocity: ${currentDataPoint.dataPointValue.velocity}`;
        const spin = `Spin: ${currentDataPoint.dataPointValue.spin}`;
        drawText(currentDataPoint.point, `${velocity}\n${spin}`, COLOR_BLACK);
    }

    if (Network.networkData != null) {
        const position = new Point(Network.networkData['position'].x, Network.networkData['position'].y);
        drawPoint(position, 3, COLOR_BLACK);
    }

    //Fill everything except tracking area
    context.fillStyle = COLOR_BACKGROUND;
    context.fillRect(0, 0, viewport.x, canvas.height);
    context.fillRect(viewport.x + viewport.width, 0, canvas.width - (viewport.x + viewport.width), canvas.height);
    context.fillRect(viewport.x, 0, viewport.width, viewport.y);
    context.fillRect(viewport.x, viewport.y + viewport.height, viewport.width, canvas.height - (viewport.y + viewport.height));

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

function drawDataPoints(){
    for (let dataPoints of dataPointList) {
        let color = dataPoints.color;
        if (dataPoints.active == false)
            color = COLOR_INDICATOR_INACTIVE;
        if (dataPoints.show) {
            for (let i = 0; i < dataPoints.dataPoints.length - 1; i++)
                drawLine(dataPoints.dataPoints[i].point, dataPoints.dataPoints[i + 1].point, color, 4);

            if(dataPoints.active){
                for (let dataPoint of dataPoints.dataPoints)
                    drawPoint(dataPoint.point, 3, color);
            }
        }
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

function drawText(point: PointInterface, text, color){
    const lineHeight = 20;
    let translatedPoint: PointInterface = point.getTranslated(trackingArea, viewport);
    let lines: string = text.split('\n');

    for(let line = 0; line < lines.length; line++) {
        context.font = '20px Arial';
        context.fillStyle = color;
        context.fillText(lines[line], translatedPoint.x, translatedPoint.y + (line*lineHeight));
    }
}