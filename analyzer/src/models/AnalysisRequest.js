import ModelBase from './ModelBase';

export default class DocumentAnalysisRequest extends ModelBase {
    constructor(requestBody) {
        super('analysisRequest', requestBody);
        // Continue here....
    }
}