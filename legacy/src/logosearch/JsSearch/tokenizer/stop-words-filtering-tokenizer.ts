/// <reference path="tokenizer.ts" />

import {ITokenizer} from "./tokenizer";

module JsSearch {

    /**
     * Stop words are very common (e.g. "a", "and", "the") and are often not semantically meaningful in the context of a
     * search. This tokenizer removes stop words from a set of tokens before passing the remaining tokens along for
     * indexing or searching purposes.
     */
    export class StopWordsTokenizer implements ITokenizer {

        private tokenizer_: ITokenizer;

        /**
         * Constructor.
         *
         * @param decoratedIndexStrategy Index strategy to be run after all stop words have been removed.
         */
        constructor(decoratedTokenizer: ITokenizer) {
            this.tokenizer_ = decoratedTokenizer;
        }

        /**
         * @inheritDocs
         */
        public tokenize(text: string): Array<string> {
            return this.tokenizer_.tokenize(text)
                .filter(function (token: string): boolean {
                    return token && StopWordsMap[token] !== token;
                });
        }
    };
}
;

export var StopWordsMap = {
    a: 'a',
    able: 'able',
    about: 'about',
    across: 'across',
    after: 'after',
    all: 'all',
    almost: 'almost',
    also: 'also',
    am: 'am',
    among: 'among',
    an: 'an',
    and: 'and',
    any: 'any',
    are: 'are',
    as: 'as',
    at: 'at',
    be: 'be',
    because: 'because',
    been: 'been',
    but: 'but',
    by: 'by',
    can: 'can',
    cannot: 'cannot',
    could: 'could',
    dear: 'dear',
    did: 'did',
    'do': 'do',
    does: 'does',
    either: 'either',
    'else': 'else',
    ever: 'ever',
    every: 'every',
    'for': 'for',
    from: 'from',
    'get': 'get',
    got: 'got',
    had: 'had',
    has: 'has',
    have: 'have',
    he: 'he',
    her: 'her',
    hers: 'hers',
    him: 'him',
    his: 'his',
    how: 'how',
    however: 'however',
    i: 'i',
    'if': 'if',
    'in': 'in',
    into: 'into',
    is: 'is',
    it: 'it',
    its: 'its',
    just: 'just',
    least: 'least',
    let: 'let',
    like: 'like',
    likely: 'likely',
    may: 'may',
    me: 'me',
    might: 'might',
    most: 'most',
    must: 'must',
    my: 'my',
    neither: 'neither',
    no: 'no',
    nor: 'nor',
    not: 'not',
    of: 'of',
    off: 'off',
    often: 'often',
    on: 'on',
    only: 'only',
    or: 'or',
    other: 'other',
    our: 'our',
    own: 'own',
    rather: 'rather',
    said: 'said',
    say: 'say',
    says: 'says',
    she: 'she',
    should: 'should',
    since: 'since',
    so: 'so',
    some: 'some',
    than: 'than',
    that: 'that',
    the: 'the',
    their: 'their',
    them: 'them',
    then: 'then',
    there: 'there',
    these: 'these',
    they: 'they',
    'this': 'this',
    tis: 'tis',
    to: 'to',
    too: 'too',
    twas: 'twas',
    us: 'us',
    wants: 'wants',
    was: 'was',
    we: 'we',
    were: 'were',
    what: 'what',
    when: 'when',
    where: 'where',
    which: 'which',
    'while': 'while',
    who: 'who',
    whom: 'whom',
    why: 'why',
    will: 'will',
    'with': 'with',
    would: 'would',
    yet: 'yet',
    you: 'you',
    your: 'your'
}