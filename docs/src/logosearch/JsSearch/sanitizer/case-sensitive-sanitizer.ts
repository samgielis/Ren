/// <reference path="sanitizer.ts" />

import {ISanitizer} from "./sanitizer";

module JsSearch {

  /**
   * Enforces case-sensitive text matches.
   */
  export class CaseSensitiveSanitizer implements ISanitizer {

    /**
     * @inheritDocs
     */
    public sanitize(text:string):string {
      return text ? text.trim() : '';
    }
  };
};