import nlp from 'compromise';

const checkInitialized = (instance) => {
    if (!instance[symAnalyis])
        throw new Error('analyzer has not yet been intialized with a query');
};

const checkRequiredString = (test, paramName) => {
    if (!(test && typeof(test) === 'string'))
        throw new Error(`"${paramName}" is required and must be a string value`);
};

const outputOptions = {
    frequencies: 'frequency',
    textOnly: 'normal'
};

const symQuery = Symbol('query');
const symAnalyis = Symbol('analysis');
const symContractions = Symbol('contractions');
const symSentences = Symbol('sentences');
const symTerms = Symbol('terms');

/**
 * A single-query extraction tool
 */
export default class NlpAnalyzerBase {
    constructor(initialQuery = null, nlpPlugins = null) {
        this[symContractions] = null;
        this[symSentences] = null;

        if (!Array.isEmpty(nlpPlugins)) {
            nlpPlugins.forEach(plugin => nlp.plugin(plugin));
        }

        if (initialQuery) {
            this.analyze(initialQuery);
        }
        else {
            this[symQuery] = null;
            this[symAnalyis] = null;
        }
    }

    get sentences() {
        checkInitialized(this);
        return this[symSentences] || (this[symSentences] = this[symAnalyis].sentences());
    }

    get sentenceFrequencies() {
        return this.sentences.out(outputOptions.frequencies);
    }

    get contractions() {
        checkInitialized(this);
        return this[symContractions] || (this[symContractions] = this[symAnalyis].contractions());
    }

    get contractionFrequencies() {
        return this.contractions.out(outputOptions.frequencies);
    }

    get allWords() {
        checkInitialized(this);
        const terms = this[symTerms] || (this[symTerms] = this[symAnalyis].terms());
        return terms.map(t => t.out(outputOptions.textOnly));
    }

    get wordFrequencies() {
        checkInitialized(this);
        const terms = this[symTerms] || (this[symTerms] = this[symAnalyis].terms());
        return terms.out(outputOptions.frequencies);
    }


    analyze(query) {
        checkRequiredString(query, 'query');

        this[symQuery] = query;

        this[symAnalyis] = nlp(query);

        this.clear(true);
    }

    clear(resultsOnly = false) {
        if (!resultsOnly) {
            this[symQuery] = this[symAnalyis] = null;
        }

        this[symTerms] = this[symContractions] = this[symSentences] = null;
    }

    contains(term) {
        checkRequiredString(term, 'term');

        return this[symAnalyis].has(term);
    }
}