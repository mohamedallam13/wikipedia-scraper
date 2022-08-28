

const { ScrapeWikipedia } = require('./scrape.js')
const { NGramAnalysis } = require('./analysis.js')


const { plot } = require('nodeplotlib')


const LANGUAGES = {
    en: "English",
    de: "German"
}

const COMPARISON_URLS = {
    en: [
        {
            link: "https://en.wikipedia.org/wiki/United_Nations",
        },
        {
            link: "https://en.wikipedia.org/wiki/Human_rights"
        }


    ],
    de: [
        {
            link: "https://de.wikipedia.org/wiki/Vereinte_Nationen"
        },
        {
            link: "https://de.wikipedia.org/wiki/Menschenrechte"
        }

    ]
};


const runAnalysis = function () {
    getReferences
}

const getScrapedWikipediaAnalysis = async function (link) {
    if (!checkIfWikipedia(link)) return
    const pageLanguage = getPageLanguage(link);
    console.log(pageLanguage);
    getAnalysisForReferences();
    const { uniGramFrequencyTable, sortedNGramFrequencyArray } = await getAnalysisOnFullPageContent(link)
    createPlot(uniGramFrequencyTable);
    // return uniGramFrequencyTable;
}

const getAnalysisForReferences = function () {
    Object.entries(COMPARISON_URLS).forEach(([langauge, linksArray]) => {
        linksArray.forEach(linkObj => {
            const { sortedNGramFrequencyArray } = await getAnalysisOnFullPageContent(linkObj.link);
            linkObj.sortedNGramFrequencyArray = sortedNGramFrequencyArray;
        })
    })
}

const getAnalysisOnFullPageContent = async function (link) {
    const scraper = await ScrapeWikipedia(link)
    const pageContent = await scraper.fetchPageContent();
    return NGramAnalysis(pageContent)
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

const createPlot = function (frequencyTable) {
    const plotObj = getPlotObj(frequencyTable);
    plot([plotObj])
}

const getPlotObj = function (sortedFrequencyTable) {
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