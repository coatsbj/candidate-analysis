import nlpGram from 'nlp-ngram';
import NlpAnalyzerBase from './NlpAnalyzerBase';

//nlp.plugin(nlpNgram);

// var t = nlp.text('she said she swims');
// t.ngram()
/*
[ [ { word: 'she', count: 2, size: 1 },
    { word: 'said', count: 1, size: 1 },
    { word: 'swims', count: 1, size: 1 } ],
  [ { word: 'she said', count: 1, size: 2 },
    { word: 'said she', count: 1, size: 2 },
    { word: 'she swims', count: 1, size: 2 } ],
  [ { word: 'she said she', count: 1, size: 3 },
    { word: 'said she swims', count: 1, size: 3 } ],
  [ { word: 'she said she swims', count: 1, size: 4 } ] ]
*/

export default class FrequencyAnalyzer extends NlpAnalyzerBase {
    constructor(initialQuery = null) {
        super(initialQuery);
    }
}