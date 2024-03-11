import {LogoSearchDataSet, LogoSearchDataPoint} from "./LogoSearchDataSet";
import {LogoSearchFactory} from "./LogoSearchFactory";
import {parseJSON} from "../util/JSONUtils";
import {Search} from "./JsSearch/Search";

export class LogoSearch {

    private _dataSet : LogoSearchDataPoint[] = [];
    private _dataURI : string;
    private _element : HTMLElement;
    private _input : HTMLInputElement;
    private _search : any;

    constructor (element : HTMLElement) {
        this._element = element;
        this._dataURI = element.getAttribute('logosearch-data');

        this._search = new Search('name');
        this._search.addIndex('name');

        this.load();
    }

    private attachInput (input : HTMLInputElement) : void {
        this._input = input;
        this._input.addEventListener('input', () => {
            console.log('input changed to', this._input.value);
            console.log('result : ', this._search.search(this._input.value));
            let queryResult : Array<LogoSearchDataPoint> = (<Array<LogoSearchDataPoint>>this._search.search(this._input.value));

            if (queryResult.length === 0) {
                for (let dataPoint of this._dataSet) {
                    dataPoint.dom.className = 'logosearch-datapoint col-sm-2';
                }
            } else {
                for (let dataPoint of this._dataSet) {

                    if (queryResult.indexOf(dataPoint) < 0) {
                        dataPoint.dom.className = 'logosearch-datapoint logosearch-datapoint-hidden col-sm-2';
                    } else {
                        dataPoint.dom.className = 'logosearch-datapoint col-sm-2';
                    }
                }
            }
        })
    }

    private load () : void {
        var xhr : XMLHttpRequest = new XMLHttpRequest();
        xhr.open("GET", this._dataURI, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                let dataSet : LogoSearchDataSet = parseJSON(xhr.responseText);
                if (dataSet.entries) {
                    this.loadDataSet(dataSet)
                }
            }
        };
        xhr.send(null);
    }
    
    private loadDataSet (dataSet : LogoSearchDataSet) {
        for (let dataPoint of dataSet.entries) {
            dataPoint.dom = LogoSearchFactory.buildDataPointview(dataPoint);
            this._dataSet.push(dataPoint);
        }

        this._dataSet.sort((dataPoint1 : LogoSearchDataPoint, dataPoint2 : LogoSearchDataPoint) => {
            if (dataPoint1.name.toLowerCase() < dataPoint2.name.toLowerCase()) {
                return -1;
            }
            if (dataPoint1.name.toLowerCase() > dataPoint2.name.toLowerCase()) {
                return 1;
            }
            return 0;
        });

        this._search.addDocuments(this._dataSet);

        let searchBar = LogoSearchFactory.buildSearchBar();
        this.attachInput(<HTMLInputElement>searchBar.querySelector('input'));
        this._element.appendChild(searchBar);

        for (let dataPoint of this._dataSet){
            this._element.appendChild(dataPoint.dom);
        }
    }
    
    static autoDetect () {
        let detectedElements : NodeList = document.querySelectorAll('.logosearch');

        for (let i = 0; i < detectedElements.length; i++) {
            if ((<HTMLElement>detectedElements.item(i)).getAttribute('logosearch-data')) {
                new LogoSearch((<HTMLElement>detectedElements.item(i)));
            }
        }
    }
}

(() => {LogoSearch.autoDetect()})();