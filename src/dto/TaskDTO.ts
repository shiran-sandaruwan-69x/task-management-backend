import {TaskDtoInterface} from "../types/DtoTypes";

export class TaskDTO {

    private _taskName: string;
    private _description: string;
    private _startDate: Date;
    private _endDate: Date;
    private _assignUser: string;
    private _status: boolean;
    private _taskStatus: string;
    private _createdAt: Date;

    constructor(taskName: string, description: string, startDate: Date, endDate: Date, assignUser: string, status: boolean, taskStatus: string, createdAt: Date) {
        this._taskName = taskName;
        this._description = description;
        this._startDate = startDate;
        this._endDate = endDate;
        this._assignUser = assignUser;
        this._status = status;
        this._taskStatus = taskStatus;
        this._createdAt = createdAt;
    }

    get taskName(): string {
        return this._taskName;
    }

    set taskName(value: string) {
        this._taskName = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get startDate(): Date {
        return this._startDate;
    }

    set startDate(value: Date) {
        this._startDate = value;
    }

    get endDate(): Date {
        return this._endDate;
    }

    set endDate(value: Date) {
        this._endDate = value;
    }

    get assignUser(): string {
        return this._assignUser;
    }

    set assignUser(value: string) {
        this._assignUser = value;
    }

    get status(): boolean {
        return this._status;
    }

    set status(value: boolean) {
        this._status = value;
    }

    get taskStatus(): string {
        return this._taskStatus;
    }

    set taskStatus(value: string) {
        this._taskStatus = value;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    set createdAt(value: Date) {
        this._createdAt = value;
    }

    toJSON(): TaskDtoInterface {
        return {
            taskName: this._taskName,
            description: this._description,
            startDate: this._startDate,
            endDate: this._endDate,
            assignUser: this._assignUser,
            status: this._status,
            taskStatus: this._taskStatus,
            createdAt: this._createdAt
        }
    }
}