/// <reference path="index-strategy.ts" />

import {IIndexStrategy} from "./index-strategy";

module JsSearch {

  /**
   * Indexes for exact word matches.
   */
  export class ExactWordIndexStrategy implements IIndexStrategy {

    /**
     * @inheritDocs
     */
    public expandToken(token:string):Array<string> {
      return token ? [token] : [];
    }
  };
};