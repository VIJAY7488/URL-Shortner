const wrapAsyncFunction = (fn: Function) => {
    return function (req: any, res: any, next: any) {
        Promise.resolve(fn(req, res, next)).catch(next);    }
}

export default wrapAsyncFunction;