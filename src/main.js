// Imports
const { load } = require("cheerio")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs-extra')

main() // Express all your hate to this main function

function main() {
    // Creates 2 constants: query and cache
    const query = process.argv[2]
        .replace("--query=", "")
        .toLowerCase()
        .split(' ').join('-')
        .replace("\'", "")
    
    const cache = process.argv[3]
        .replace("--cache=", "")

    const current = process.argv[4]
        .replace("--current=", "")

    // Logs them for fun
    console.log(`Query: ${query}\nCache Location: ${cache}`)
    scrapeUrls(`https://store.steampowered.com/search/?term=${query}`, cache, current)
}

// Function Hell
async function scrapeUrls(url, cacheLoc, currentRes) {
    const res = await fetch(url)
    const html = await res.text();
    
    const $ = load(html) // jQuery

    // Checks if no results are found
    // If no results are found, log a message then exit with error code 1
    const isNull = $(".search_results_count").text() == "0 results match your search." ? true : false
    if (isNull) { console.log("\nNo results found. Perhaps your query is wrong"); process.exit(1) }

    // Defines an Array of urls gathered from Steam Search Page
    let urlsArray = []

    // Loops 10 times
    for(var i = 1; i < 11; i++) {
        // Pushes the urls gathered to urlsArray
        urlsArray.push($(`.search_result_row:nth-child(${i})`).attr('href'))    
    }

    // Calls the scrapeData function with urlsArray as a parameter
    scrapeData(urlsArray, cacheLoc, currentRes)
}

async function scrapeData(UrlsArray, cacheLoc, currentRes) {
    // Checks if the UrlsArray param is an Array, if not then exit
    if (Array.isArray(UrlsArray)) {
        if (fs.existsSync(cacheLoc)) {
            // Defines an response object
            let responseObj = JSON.parse(fs.readFileSync(cacheLoc))

            UrlsArray.forEach(async i => {
                // PSA: Not that much data was able to be gathered, since steam has a age check

                // Defines variables for the game names and id's
                let gameNames = i.replace(/(https:\/\/store\.steampowered\.com\/app\/(\d*\/))|(\/.*)/g, "").replace(/([_])/g, " ")
                let gameIds = i.replace(/(https:\/\/store\.steampowered\.com\/app\/)|(\/.*)/g, "")

                // Defines a object containg both variables up and also the url as "i"
                let data = {
                    name: gameNames,
                    url: i,
                    id: gameIds
                }

                // Pushes the data obj to response
                responseObj.response.push(data)
            })

            // After everything is done, create 2 files, one for the current response and a cache for later purposes
            fs.writeFileSync(cacheLoc, JSON.stringify(responseObj))
            fs.writeFileSync(currentRes, JSON.stringify(responseObj))
        } else {
            // Defines an response object
            let responseObj = {
                response: [

                ]
            }

            UrlsArray.forEach(async i => {
                // PSA: Not that much data was able to be gathered, since steam has a age check

                // Defines variables for the game names and id's
                let gameNames = i.replace(/(https:\/\/store\.steampowered\.com\/app\/(\d*\/))|(\/.*)/g, "").replace(/([_])/g, " ")
                let gameIds = i.replace(/(https:\/\/store\.steampowered\.com\/app\/)|(\/.*)/g, "")

                // Defines a object containg both variables up and also the url as "i"
                let data = {
                    name: gameNames,
                    url: i,
                    id: gameIds
                }

                // Pushes the data obj to response
                responseObj.response.push(data)
            })

            // After everything is done, create 2 files, one for the current response and a cache for later purposes
            fs.writeFileSync(cacheLoc, JSON.stringify(responseObj))
            fs.writeFileSync(currentRes, JSON.stringify(responseObj))
        }
    } else {
        console.log("\nArray in parameters isn't array")
        process.exit(1)
    }
}
