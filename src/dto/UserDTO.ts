import {UserDtoInterface} from "../types/DtoTypes";

export class UserDTO{

    private _firstname: string;
    private _lastname: string;
    private _email: string;
    private _password: string;
    private _mobileNumber: string;
    private _role: "admin" | "user";
    private _address: string;
    private _status: boolean;
    private _createdAt: Date;

    constructor(firstname: string, lastname: string, email: string, password: string, mobileNumber: string, role: "admin" | "user", address: string, status: boolean, createdAt: Date) {
        this._firstname = firstname;
        this._lastname = lastname;
        this._email = email;
        this._password = password;
        this._mobileNumber = mobileNumber;
        this._role = role;
        this._address = address;
        this._status = status;
        this._createdAt = createdAt;
    }

    get firstname(): string {
        return this._firstname;
    }

    set firstname(value: string) {
        this._firstname = value;
    }

    get lastname(): string {
        return this._lastname;
    }

    set lastname(value: string) {
        this._lastname = value;
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        this._email = value;
    }

    get mobileNumber(): string {
        return this._mobileNumber;
    }

    set mobileNumber(value: string) {
        this._mobileNumber = value;
    }

    get role(): "admin" | "user" {
        return this._role;
    }

    set role(value: "admin" | "user") {
        this._role = value;
    }

    get address(): string {
        return this._address;
    }

    set address(value: string) {
        this._address = value;
    }

    get status(): boolean {
        return this._status;
    }

    set status(value: boolean) {
        this._status = value;
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    set createdAt(value: Date) {
        this._createdAt = value;
    }

    toJSON():UserDtoInterface{
        return {
            firstName:this._firstname,
            lastName:this._lastname,
            email: this._email,
            password: this._password,
            mobileNumber: this._mobileNumber,
            role:this._role,
            address:this._address,
            status:this._status,
            createdAt: this._createdAt
        }
    }
}