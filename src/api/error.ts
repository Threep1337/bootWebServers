import { Request, Response, NextFunction } from "express";

export class httpError extends Error {
    statusCode: number;
    constructor(message: string, statuscode: number) {
        super(message);
        this.statusCode = statuscode;
    }
}
export class badRequestError extends httpError {
    constructor(message: string) {
        super(message, 400);

    }
}

export class unauthorizedError extends httpError {
    constructor(message: string) {
        super(message, 401);
    }
}

export class forbiddenError extends httpError {
    constructor(message: string) {
        super(message, 403);

    }
}

export class notFoundError extends httpError {
    constructor(message: string) {
        super(message, 404);
    }
}


export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err);

    if (err instanceof httpError) {
        res.status(err.statusCode).json({
            error: `${err.message}`
        }
        );
    }
    else {
        res.status(500).json(
            {
                error: "Something went wrong on our end",
            }
        );

    }

}