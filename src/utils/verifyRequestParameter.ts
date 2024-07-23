export default class VerifyRequestParameter {

    private static _verifyParameterMethod<T>(body: T, hasProperty: Array<string>): boolean {

        // if (Object.keys(body).length !== hasProperty.length) {
        //     return false;
        // }

        for (let property of hasProperty) {
            if (!Object.prototype.hasOwnProperty.call(body, property)) {
                return false;
            }
        }

        return true;
    }

    public static verify<T>(requestBody: T, hasProperty: Array<string>, isArray?: boolean): boolean {

        let isArrayFor = true;

        if (isArray !== undefined) {
            if (!isArray) {
                isArrayFor = false;
            }
        }

        if (isArrayFor && Array.isArray(requestBody)) {
            for (let body of requestBody) {
                if (!this._verifyParameterMethod(body, hasProperty)) {
                    return false;
                }
            }
        } else if (!this._verifyParameterMethod(requestBody, hasProperty)) {
            return false;
        }

        return true;
    }
}
