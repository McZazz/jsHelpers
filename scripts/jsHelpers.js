// created by McZazz, found at https://github.com/McZazz/cssRangeMapper
/*
Author:   Kevin Price
Date:     October 23 2021
Filename: jsHelpers.js
*/
/*
* @targetRangeMax: number, maximum of target range of our css target property
* @targetRangeMin: number, minimum of target range of our css target property
*
* @targetUnits: string, 'px', 'rem', '%', etc
*
* @targetElse: number, number to revert to when outside of targeted range
*
* @invert: boolean, true == screen gets smaller, css param gets smaller, false inverts this
*
* @targetId: string, id of element we will manipulate
* @targetParams: string, param to select in usualway: document.getElementById(targetId).style[targetParams];
*
* @sourceType: string, 'windowInnerWidth' (only option available for now)
*
* @'mediaQueryRange': screen sizes correspond to bootstrap sizes, or numbers, in an array:
* 'xs': (<= 575px), 'sm': (576px to 767px), 'md': (768px to 991px), 'lg': (992px to 1199px), 'xl': (>= 1200), 'all'
* 'mediaQueryRange' of ['xs', 'xl'] sets the media query range from the lowest to highest bootstrap equivalent
* size passed. 'mediaQueryRange' of [300, 1000] sets the range as well.
*
* construct one rangeMapper per each screen size range needed, per each element to effect.
*
* example params to enter at time of object construction:
*
* let params = {'targetRangeMin': 3, 'targetRangeMax': 8, 'targetUnits': 'px',
*               'targetId': 'some-element-with-an-id', 'targetParams': ['marginBottom', 'marginTop'],
*               'sourceType': 'windowInnerWidth', 'invert': false,
*               'mediaQueryRange': ['xs', 'xl']};
*/
class RangeMapper {
    constructor(params) {
        this.targetRangeMin = params['targetRangeMin'];
        this.targetRangeMax = params['targetRangeMax'];
        this.targetUnits = params['targetUnits'];
        this.targetId = params['targetId'];
        this.target = document.getElementById(params['targetId']);
        this.targetParams = params['targetParams'];
        this.sourceType = params['sourceType'];
        this.targetElse = params['targetElse'];
        this.invert = params['invert'];
        // set up media query ranges
        this.setMediaQueryMax(params);
        // this makes the class just run on it's own, set it and forget it
        this.setListener();
    }

    /*
    * used in constructor to get min and max of media query range to apply all this to, inclusive
    * 'xs' (<= 575px), 'sm' (576px to 767px), 'md' (768px to 991px), 'lg' (992px to 1199px), 'xl' (>= 1200)
    */
    setMediaQueryMax(params) {

        let queryArray = params['mediaQueryRange'];

        // check types if 2 items were passed
        let isNumsCounter = 0;
        if (queryArray.length === 2) {
            for (let i = 0; i < queryArray.length; i++) {
                if (typeof queryArray[i] === 'number') {
                    isNumsCounter++;
                }
            }
        }
        // if both passed values were numbers, set the fields as below
        if (isNumsCounter === 2) {
            this.mediaQueryTop = Math.max(queryArray[0], queryArray[1]);
            this.mediaQueryBot = Math.min(queryArray[0], queryArray[1]);
        } else { // all other cases should be the applicable bootstrap equivalent strings
            let low = 6400;
            let high = -1;
            for (let i = 0; i < queryArray.length; i++) {
                let queryParam = queryArray[i];
                let currLow = -1;
                let currHigh = 6400;

                if (queryParam === 'xl') {
                    currHigh = 6400;
                    currLow = 2000;
                }
                else if (queryParam === 'lg') {
                    currHigh = 1199;
                    currLow = 992;
                }
                else if (queryParam === 'md') {
                    currHigh = 991;
                    currLow = 768;
                }
                else if (queryParam === 'sm') {
                    currHigh = 767;
                    currLow = 576;
                }
                else if (queryParam === 'xs') {
                    currHigh = 575;
                    currLow = 0;
                } else {
                    currHigh = 6400;
                    currLow = 0;
                }

                high = Math.max(currHigh, high);
                low = Math.min(currLow, low);
            }
            this.mediaQueryTop = high;
            this.mediaQueryBot = low;
        }
    }

    /*
    * start the event listener, setup for future feature additions
    * set it and forget it
    */
    setListener() {
        // grab them while we can
        let sourceType = this.sourceType;
        let targetUnits = this.targetUnits;
        let mediaQueryBot = this.mediaQueryBot;
        let mediaQueryTop = this.mediaQueryTop;
        let targetRangeMax = this.targetRangeMax;
        let targetRangeMin = this.targetRangeMin;
        let targetParams = this.targetParams;
        let targetId = this.targetId;
        let targetElse = this.targetElse;
        let invert = this.invert;

        // console.log('chosen range ' + mediaQueryBot + ' ' + mediaQueryTop)
        this.runRangeMap(sourceType, targetUnits, mediaQueryBot, mediaQueryTop, targetRangeMax, targetRangeMin, targetParams, targetId, targetElse, invert);

        window.addEventListener('resize', function() {
            // console.log('currently this wide: ' + window.innerWidth)
            // only running for window.innerWIdth source for now, later on can add others
            if (sourceType === 'windowInnerWidth') {
                RangeMapper.prototype.runRangeMap(sourceType, targetUnits, mediaQueryBot, mediaQueryTop, targetRangeMax, targetRangeMin, targetParams, targetId, targetElse, invert);
            }
        });
    }

    runRangeMap(sourceType, targetUnits, mediaQueryBot, mediaQueryTop, targetRangeMax, targetRangeMin, targetParams, targetId, targetElse, invert) {
        let sourceCurrValue = window.innerWidth;
        if (sourceCurrValue <= mediaQueryTop && sourceCurrValue >= mediaQueryBot) {
            // math for this was found at stackexchange at:
            // https://gamedev.stackexchange.com/questions/33441/how-to-convert-a-number-from-one-min-max-set-to-another-min-max-set
            // currentTarget_margin = (((currScreenWidth - minScreenWidth) / (maxScreenWidth - minScreenWidth)) * (targetMax - targetMin)) + targetMin
            let finalNum = (((sourceCurrValue - mediaQueryBot) / (mediaQueryTop - mediaQueryBot)) * (targetRangeMax - targetRangeMin)) + targetRangeMin
            if (invert === true) {
                finalNum = targetRangeMax - finalNum;
            }
            // console.log('magic num: ' + finalNum);
            // clean it up and add the units
            finalNum = (Math.floor(finalNum * 10) / 10).toString() + targetUnits;
            // console.log('curr: ' + sourceCurrValue + ', finalnum: ' + finalNum)
            // update the chosen element(s) css properties
            for (let i = 0; i < targetParams.length; i++) {
                document.getElementById(targetId).style[targetParams[i]] = finalNum;
            }
            // console.log('final num: '+ finalNum)
            // this.target.style[this.targetParams] = finalNum;
        } else {
            for (let i = 0; i < targetParams.length; i++) {
                document.getElementById(targetId).style[targetParams[i]] = targetElse.toString() + targetUnits;
            }
        }
    }
}



//
