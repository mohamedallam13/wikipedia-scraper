//Baed on https://www.let.rug.nl/~vannoord/TextCat/textcat.pdf
//and on https://cloudmark.github.io/Language-Detection/#:~:text=The%20system%20is%20based%20on,profiles%20to%20make%20its%20detection.
const NGramAnalysis = function (text) {

    const N = 3

    const getUniGramFrequencyTable = function (text) {
        const uniGramFrequencyTable = {};
        const lettersArray = getArrayOfLetters(text)
        lettersArray.forEach(char => {
            if (!uniGramFrequencyTable[char]) uniGramFrequencyTable[char] = 0;
            uniGramFrequencyTable[char]++
        }, {})
        return uniGramFrequencyTable
    }

    const getNGramFrequencyTable = function (text, initialNGramFrequency = uniGramFrequencyTable) {
        const newNGramTable = getNewNGramTable(initialNGramFrequency);
        Object.keys(newNGramTable).forEach(combination => {
            const pattern = new RegExp(`${combination}`, 'g');
            const matches = text.match(pattern);
            const frequency = matches ? matches.length : 0;
            newNGramTable[combination] = frequency;
        })
        return newNGramTable;
    }

    const getAllNGramsFrequencyArray = function (text) {
        const nGramFrequencyArray = [];
        nGramFrequencyArray[0] = uniGramFrequencyTable;
        let i = 1;
        while (i < N) {
            nGramFrequencyArray[i] = getNGramFrequencyTable(text, nGramFrequencyArray[i - 1])
            i++
        }
        return nGramFrequencyArray
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
            Object.entries(frequencyTable).filter(([, value]) => value > 0).sort(([, a], [, b]) => b - a).slice(0, 300)
        );
        return sortedFrequencyTable
    }

    const getArrayOfLetters = function (pageContent) {
        return pageContent.split('').filter(char => /[a-z]/g.test(char)).sort();
    }

    const getSortedNGramFrequencyArray = function (nGramFrequencyArray) {
        return nGramFrequencyArray.map(nGramFrequencyTable => sortCleanFrequencyTable(nGramFrequencyTable))
    }

    const uniGramFrequencyTable = sortCleanFrequencyTable(getUniGramFrequencyTable(text));
    const nGramFrequencyArray = getAllNGramsFrequencyArray(text);
    const sortedNGramFrequencyArray = getSortedNGramFrequencyArray(nGramFrequencyArray);

    return {
        uniGramFrequencyTable,
        nGramFrequencyArray,
        sortedNGramFrequencyArray
    }

}

module.exports = {
    NGramAnalysis
}
