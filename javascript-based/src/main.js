

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


const getScrapedWikipediaAnalysis = async function (link) {
    if (!checkIfWikipedia(link)) return
    const pageLanguage = getPageLanguage(link);
    console.log(pageLanguage);
    await getAnalysisForReferences();
    const { uniGramFrequencyTable, sortedNGramFrequencyArray } = await getAnalysisOnFullPageContent(link)
    createPlot(uniGramFrequencyTable);
    // guessLangauge(sortedNGramFrequencyArray);
    const stop = 1
    // return uniGramFrequencyTable;
}

const getAnalysisForReferences = async function () {
    for (let lang in COMPARISON_URLS) {
        const linksArray = COMPARISON_URLS[lang];
        for (let linkObj of linksArray) {
            const { sortedNGramFrequencyArray } = await getAnalysisOnFullPageContent(linkObj.link);
            linkObj.refSortedNGramFrequencyArray = sortedNGramFrequencyArray;
        }
    }
}

const guessLangauge = function (sortedNGramFrequencyArray) {
    getAllRankDifferences(sortedNGramFrequencyArray);
    const lang = getLowestRank();
    console.log(`From text, Language is ${LANGUAGES[lang]}`)
}

const getAllRankDifferences = function (sortedNGramFrequencyArray) {
    const N = 2;
    Object.entries(COMPARISON_URLS).forEach(([, linksArray]) => {
        linksArray.forEach(linkObj => {
            const { refSortedNGramFrequencyArray } = linkObj;
            const sortedNGramTable = Object.keys(sortedNGramFrequencyArray[N]);
            const sortedRefNGramTable = Object.keys(refSortedNGramFrequencyArray[N]);
            calculateRankDifferences(linkObj, sortedNGramTable, sortedRefNGramTable);
        })
    })
}

const calculateRankDifferences = function (linkObj, sortedNGramTable, sortedRefNGramTable) {
    let diff = 0;
    sortedNGramTable.forEach((syllable, i) => {
        let refRank = sortedRefNGramTable.indexOf(syllable);
        if (refRank < 0) refRank = sortedRefNGramTable.length;
        diff = diff + Math.abs((refRank - i));
    })
    linkObj.diff = diff;
}

const getLowestRank = function () {


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

const link = "https://en.wikipedia.org/wiki/Web_scraping"

getScrapedWikipediaAnalysis(link);
// console.log(frequencyTable)