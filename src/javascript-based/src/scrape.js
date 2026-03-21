const axios = require('axios');
const cheerio = require('cheerio');

const ScrapeWikipedia =  async function(link){
    const res = await axios.get(link);
    const fetchPageContent = async function () {
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

    return{
        fetchPageContent
    }

}

module.exports = {
    ScrapeWikipedia
}


