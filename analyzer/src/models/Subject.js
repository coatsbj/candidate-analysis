import ModelBase from './ModelBase';

/**
 * Extending base persistable model with some subject-specific "strong-typing"
 */
export default class Subject extends ModelBase {
    constructor(subjectData = null) {
        super('subject', subjectData);
    }
}