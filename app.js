// const axios = require('axios');
//const fs = require('fs');
//var express = require('express');
//var request = require('request');
//const { response } = require('express');
//var app = express();

//Nightmare is a high-level browser automation library.Nightmare is similar to axios or any other request making library but what makes it odd is that it uses Electron under the cover, which is similar to PhantomJS but roughly twice as fast and more modern.
const Nightmare = require('nightmare');
// jQuery for Node.js. Cheerio makes it easy to select, edit, and view DOM elements.
//Cheerio for handling DOM content by fetching innerHTML through evaluate function and pass the content (innerHTML) to Cheerio 
const cheerio = require('cheerio');
// official MongoDB driver for Node.js. Provides a high-level API on top of mongodb-core that is meant for end users.
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

// For getting connected to database
const connectionUrl = "mongodb://127.0.0.1/27017"
// Const for database name
const databaseName = "web-scraping"
//initialize the nightmare and set the show property true so we can monitor what the browser is doing on execution
const nightmare = Nightmare({show:true})
// const for website url
const url = "http://www.flipkart.com/";
/* We made a request to url through goto function and wait for the DOM to be rendered through wait function 
else it executes the next followup steps without rendering of the content completely. 
Once the body is loaded completely, we fetch the innerHTML using evaluate function and return the data. 
At last, we close the browser by calling end function.
 */
nightmare
.goto(url)
.wait('body')
.click('button._2AkmmA._29YdH8')
//For interacting with the webpage, we need to use click and type function
.type('input.LM6RPg','web scrapping books')
.click('button.vh79eN')
.wait('div.bhgxx2')
.evaluate(() => document.querySelector('body').innerHTML)
.end()
.then(response => {
    console.log(getData(response));
}).catch(err=>{
    console.log(err);
})
// function for scraping data using cheerio
let getData = html => {
    data = [];
    const $ = cheerio.load(html);
    $('div._1HmYoV._35HD7C:nth-child(2) div.bhgxx2.col-12-12').each((row, raw_element) => {
      $(raw_element).find('div div div').each((i, elem) => {
        let title = $(elem).find('div div a:nth-child(2)').text();
        let link = $(elem).find('div div a:nth-child(2)').attr('href');
        if (title) {
          data.push({
            title : title,
            link : link
          });
        }
      });
    });
    const scrap_data = JSON.stringify(data,null,4);
// Connection to mongo    
    MongoClient.connect(connectionUrl,{useNewUrlParser:true},(error,client)=>{
        if(error){
            return console.log("Unable to connect to database")
        }
        console.log("Connected successfully")
// Connection to databse    
        const db = client.db(databaseName)
// Inserting data in database
        db.collection('scraped_data').insertOne({
            data
        })
    
    })

    // fs.writeFile('output.json', JSON.stringify(data,null,4), function(err){

    //     console.log('File successfully written!');

    // })
  }
