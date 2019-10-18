/// <reference path="references.ts" />
module CanvasHandler {
    export interface PointInterface {
        x: number;
        y: number;

        getTranslated(rect: Rectangle, other: Rectangle): Point;
        distance(other: PointInterface): number;
    }

    export interface RectangleInterface {
        x: number;
        y: number;
        width: number;
        height: number;

        getRatio(other: Rectangle): Point;
    }

    export interface DataPointInterface{
        point: PointInterface;
        dataPointValue: DataPointValueInterface;
        timestamp: number;
    }

    export interface DataPointValueInterface{
        velocity: number;
        spin: number;
    }

    export interface DataPointListInterface{
        name: string;
        dataPoints: Array<DataPointInterface>;
        active: boolean;
        show: boolean;
        color: string;
        startTimestamp: number;

        getClosest(x: number, y: number): DataPointInterface;
    }

    export class Point implements PointInterface {
        x: number;
        y: number;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        getTranslated(from: Rectangle, to: Rectangle): Point {
            let ratio: Point = from.getRatio(to);
            return new Point((this.x - from.x) * ratio.x + to.x, (this.y - from.y) * ratio.y + to.y)
        }

        distance(other: Point): number {
            return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
        }
    }

    export class Rectangle implements RectangleInterface {
        x: number;
        y: number;
        width: number;
        height: number;

        constructor(x: number, y: number, width: number, height: number) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }

        getRatio(other: Rectangle): Point {
            return new Point(other.width / this.width, other.height / this.height);
        }
    }

    export class DataPointList implements DataPointListInterface{
        name: string;
        dataPoints: Array<DataPointInterface>;
        active: boolean;
        show: boolean;
        color: string;
        startTimestamp: number;

        constructor(name: string, dataPoints: Array<DataPointInterface>, active: boolean, show: boolean, color: string, startTimestamp: number){
            this.name = name;
            this.dataPoints = dataPoints;
            this.active = active;
            this.show = show;
            this.color = color;
            this.startTimestamp = startTimestamp;
        }

        getClosest(x:number, y: number){
            let closestDataPoint;
            let closestDistance;
            for (let i = 0; i < this.dataPoints.length; i++){
                let distance = new Point(x, y).distance(this.dataPoints[i].point);
                if(closestDistance == undefined || distance < closestDistance){
                    closestDistance = distance;
                    closestDataPoint = this.dataPoints[i];
                }
            }
            return closestDataPoint;
        }
    }
}