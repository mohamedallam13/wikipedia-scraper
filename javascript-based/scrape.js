const axios = require('axios');
const cheerio = require('cheerio');
const { get } = require('http');

const { plot } = require('nodeplotlib')


const LANGUAGES = {
    en: "English",
    de: "German"
}

let uniGramFrequencyTable
const nGramFrequencyArray = [];

const N = 4
const getScrapedWikipediaAnalysis = async function (link) {
    if (!checkIfWikipedia(link)) return
    const pageLanguage = getPageLanguage(link);
    console.log(pageLanguage);
    const pageContent = await fetchPageContent(link);
    uniGramFrequencyTable = getUniGramFrequencyTable(pageContent);
    console.log(uniGramFrequencyTable);
    getAllNGramsFrequencyArray(pageContent);
    createPlot(nGramFrequencyArray[3]);
    // return uniGramFrequencyTable;
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

const getUniGramFrequencyTable = function (pageContent) {
    const uniGramFrequencyTable = {};
    const lettersArray = getArrayOfLetters(pageContent)
    lettersArray.forEach(char => {
        if (!uniGramFrequencyTable[char]) uniGramFrequencyTable[char] = 0;
        uniGramFrequencyTable[char]++
    }, {})
    return uniGramFrequencyTable
}

const getNGramFrequencyTable = function (pageContent, initialNGramFrequency = uniGramFrequencyTable) {
    const newNGramTable = getNewNGramTable(initialNGramFrequency);
    Object.keys(newNGramTable).forEach(combination => {
        const pattern = new RegExp(`${combination}`, 'g');
        const matches = pageContent.match(pattern);
        const frequency = matches ? matches.length : 0;
        newNGramTable[combination] = frequency;
    })
    return newNGramTable;
}

const getAllNGramsFrequencyArray = function (pageContent) {
    nGramFrequencyArray[0] = uniGramFrequencyTable;
    let i = 1;
    while (i < N) {
        nGramFrequencyArray[i] = getNGramFrequencyTable(pageContent, nGramFrequencyArray[i - 1])
        i++
    }
}

const getNewNGramTable = function (initialNGramFrequency) {
    const newNGramFrequency = {};
    Object.keys(initialNGramFrequency).forEach(letters => {
        Object.keys(uniGramFrequencyTable).forEach(letter => {
            const combination = letters + letter;
            newNGramFrequency[combination] = 0;
        })
    })
    return newNGramFrequency
}

const sortCleanFrequencyTable = function (frequencyTable) {
    const sortedFrequencyTable = Object.fromEntries(
        Object.entries(frequencyTable).filter(([, value]) => value > 0).sort(([, a], [, b]) => b - a).slice(0,300)
    );
    return sortedFrequencyTable
}

const getArrayOfLetters = function (pageContent) {
    return pageContent.split('').filter(char => /[a-z]/g.test(char)).sort();
}

const createPlot = function (frequencyTable) {
    const plotObj = getPlotObj(frequencyTable);
    plot([plotObj])
}

const getPlotObj = function (frequencyTable) {
    const sortedFrequencyTable = sortCleanFrequencyTable(frequencyTable)
    console.log(sortedFrequencyTable)
    const plotObj = {
        x: [],
        y: [],
        type: 'scatter'
    }
    Object.entries(sortedFrequencyTable).forEach(([letter, frequency]) => {
        plotObj.x.push(letter)
        plotObj.y.push(frequency)
    })
    console.log(plotObj)
    return plotObj
}

const link = "https://de.wikipedia.org/wiki/Screen_Scraping"

getScrapedWikipediaAnalysis(link);
// console.log(frequencyTable)