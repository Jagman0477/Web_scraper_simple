const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs/promises");

const app = express();
const port = process.env.PORT || 5000;
const website = "https://www.nobroker.in/flats-for-sale-in-koramangala_bangalore";

const getData = async() => {
    try{
        area();
        url();
    } catch(e){
        console.log(e);
    }
}

getData();




//Function for Area
async function area(){
    const areaData = []
        let htmlData = await axios.get(website);
        const $ = cheerio.load(htmlData.data);
        const fd = await fs.open("data.json", "w");
        $('div[class = "bg-white rounded-4 bg-clip-padding overflow-hidden my-1.2p mx-0.5p tp:border-b-0 shadow-defaultCardShadow tp:shadow-cardShadow tp:mt-0.5p tp:mx-0 tp:mb:1p hover:cursor-pointer nb__2_XSE"]').map((i, el) => {
            let area = $(el).find('div[class = "mt-0.5p overflow-hidden overflow-ellipsis whitespace-nowrap max-w-70 text-gray-light leading-4 po:mb-0.1p po:max-w-95"]').text();
            let obj = {
                id: i,
                area: area
            }
            areaData.push(obj);
        })
        await fd.writeFile(JSON.stringify({AreaData : areaData}));
        await fd.close();
}

//Function for Url
async function url(){
    const urlData = []
    const ageData = []

        let htmlData = await axios.get(website);
        const $ = cheerio.load(htmlData.data);    
        const fd = await fs.open("urlData.json", "w");
        const fp = await fs.open("ageData.json", "w");

        const elements = $('div[class = "bg-white rounded-4 bg-clip-padding overflow-hidden my-1.2p mx-0.5p tp:border-b-0 shadow-defaultCardShadow tp:shadow-cardShadow tp:mt-0.5p tp:mx-0 tp:mb:1p hover:cursor-pointer nb__2_XSE"]').toArray();
        // console.log(elements);
        for(const [i, el] of elements.entries()){
            let url = $(el).find('a').attr("href");
                let obj = {
                    id: i,
                    url: url
                };
                let age = await buildingAge(url)
                if(age !== undefined){
                    ageData.push({id: i, ageOfBuilding: age});
                    urlData.push(obj);
                }
        }

        await fd.writeFile(JSON.stringify({URLData : urlData}));
        await fp.writeFile(JSON.stringify({AgeData : ageData}));
        await fd.close();
        await fp.close();
}

//Function for Age
async function buildingAge(url){
    let ageData = '';
        let htmlData = await axios.get("https://www.nobroker.in/"+url);
        const promises = [];
        const $ = cheerio.load(htmlData.data);
        const element = $('div[class = "nb__28cwR"]')
        for(let i=0; i<element.length; i++){
            const el = element[i];
            promises.push(ageData += await el.children[0].children[2].children[0]?.children[0].data)
        }
        await Promise.all(promises);
        return ageData;      
}

app.listen(5000, () => {
    console.log(`Scraper is running at port ${port}`);
})