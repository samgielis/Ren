import { FBResponse } from "./IFBResponse";
import { Loadable } from "../Loadable";
import { ScriptTag } from "../library/ScriptTag";

const proxyURL = "https://ren-fb-proxy.netlify.app/.netlify/functions/";
export const FB_PAGE_ID: string = "215470341909937";

interface IFacebookSDK {
  init: any;
  api(graphpath: string, callback: (response: FBResponse) => any): void;
}

export class FacebookProxy {
  public static feed(
    succ: (info: FBResponse) => void,
    fail?: () => void
  ): void {
    FacebookProxy.get("news", succ, fail);
  }

  public static openinghours(
    succ: (info: FBResponse) => void,
    fail?: () => void
  ): void {
    FacebookProxy.get("hours", succ, fail);
  }

  private static get(
    url: string,
    succ: (info: FBResponse) => void,
    fail?: () => void
  ): void {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("get", proxyURL + url, true);
      xhr.responseType = "json";
      xhr.onload = function () {
        var status = xhr.status;
        if (status == 200) {
          succ(xhr.response);
        } else if (fail) {
          fail();
        }
      };
      xhr.onerror = fail;
      xhr.send();
    } catch (e) {
      if (fail) {
        fail();
      }
    }
  }
}
