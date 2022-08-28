const axios = require('axios');
const cheerio = require('cheerio');

const { plot } = require('nodeplotlib')


const LANGUAGES = {
    en: "English",
    de: "German"
}

const getWikipediaPAgeCharacterFrequencyTable = async function (link) {
    if (!checkIfWikipedia(link)) return
    const pageLanguage = getPageLanguage(link);
    console.log(pageLanguage);
    const pageContent = await fetchPageContent(link);
    const frequencyTable = getFrequencyTable(pageContent);
    createPlot(frequencyTable);
    // return frequencyTable;
}

const checkIfWikipedia = function (link) {
    const isWikipedia = link.toLowerCase().includes("wikipedia");
    if (!isWikipedia) {
        console.log("Not wikipedia!");
    }
    return isWikipedia
}

const getPageLanguage = function (link) {
    const subdomainPattern = /(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i
    const subdomain = link.match(subdomainPattern)[1]
    console.log(subdomain)
    if (!LANGUAGES[subdomain]) {
        console.log("Langauge undetermined!")
        return;
    }
    return LANGUAGES[subdomain]
}

const fetchPageContent = async function (link) {
    const res = await axios.get(link);
    const { data } = res;
    const pageContent = getAllPageContent(data);
    return pageContent
}

const getAllPageContent = function (data) {
    const $ = cheerio.load(data);
    let bodyArr = ['p', 'h3', 'h2'].reduce((acc, elementType) => {
        const allElementsOfTypeArr = $('.mw-parser-output').find(elementType).toArray().map(element => $(element).text());
        return [...acc, ...allElementsOfTypeArr]
    }, [])
    return bodyArr.join(" ").toLowerCase();
}

const getFrequencyTable = function (pageContent) {
    const frequencyTable = {};
    const lettersArray = getArrayOfLetters(pageContent)
    lettersArray.forEach(char => {
        if (!frequencyTable[char]) frequencyTable[char] = 0;
        frequencyTable[char]++
    }, {})
    return frequencyTable
}

const getArrayOfLetters = function (pageContent) {
    return pageContent.split('').filter(char => /[a-z]/g.test(char)).sort();
}

const createPlot = function (frequencyTable) {
    const plotObj = getPlotObj(frequencyTable);
    plot([plotObj])
}

const getPlotObj = function (frequencyTable) {
    console.log(frequencyTable)
    const plotObj = {
        x: [],
        y: [],
        type: 'scatter'
    }
    Object.entries(frequencyTable).forEach(([letter, frequency]) => {
        plotObj.x.push(letter)
        plotObj.y.push(frequency)
    })
    console.log(plotObj)
    return plotObj
}

const link = "https://en.wikipedia.org/wiki/Web_scraping"

getWikipediaPAgeCharacterFrequencyTable(link);
// console.log(frequencyTable)