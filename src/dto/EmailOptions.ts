export class EmailOptions {

    private _emailTo:string;
    private _subject:string;
    private _message:string;
    private _data?:any;
    private _html?:string;


    constructor(emailTo: string, subject: string, message: string, data?: any, html?: string) {
        this._emailTo = emailTo;
        this._subject = subject;
        this._message = message;
        this._data = data;
        this._html = html;
    }

    get emailTo(): string {
        return this._emailTo;
    }

    set emailTo(value: string) {
        this._emailTo = value;
    }

    get subject(): string {
        return this._subject;
    }

    set subject(value: string) {
        this._subject = value;
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        this._message = value;
    }

    get html(): string {
        return this._html;
    }

    set html(value: string) {
        this._html = value;
    }


    get data(): any {
        return this._data;
    }

    set data(value: any) {
        this._data = value;
    }
}