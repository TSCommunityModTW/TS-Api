declare namespace Express {

    interface IDecoded {
        _id: string;
        iss: string;
        sub: string;
        iat: number;
        exp: number;
        role: string;
    }

    export interface Request {
        user: IDecoded;
    }
}
