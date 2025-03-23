export class CustomResponse{

    private _status :number;
    private _message :string;
    private _data? :any;
    private _totalPages? :number;
    private _totalRecodes? :number;
    private _currentPage? :number;

    constructor(status: number, message: string, data?: any,
                totalPages?: number, totalRecodes?: number, currentPage?: number) {
        this._status = status;
        this._message = message;
        this._data = data;
        this._totalPages = totalPages;
        this._totalRecodes = totalRecodes;
        this._currentPage = currentPage;
    }

    get status(): number {
        return this._status;
    }

    set status(value: number) {
        this._status = value;
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        this._message = value;
    }

    get totalPages(): number {
        return<number> this._totalPages;
    }

    set totalPages(value: number) {
        this._totalPages = value;
    }

    get data(): any {
        return this._data;
    }

    set data(value: any) {
        this._data = value;
    }

    get totalRecodes(): number {
        return this._totalRecodes;
    }

    set totalRecodes(value: number) {
        this._totalRecodes = value;
    }

    get currentPage(): number {
        return this._currentPage;
    }

    set currentPage(value: number) {
        this._currentPage = value;
    }

    toJSON(){
        return{
            status:this.status,
            message:this.message,
            data:this.data,
            totalPages:this.totalPages,
            totalRecode:this.totalRecodes,
            currentPage:this.currentPage
        }
    }

}