const express = require("express");
const dotenv = require('dotenv').config();
const mysql = require('mysql2');
const { country } = require("./server");
const server = express();
const joi = require("joi");

server.use(express.json());

/*
Man ska kunna hämta information om ett land.
Informationen måste vara följande: Befolkning, huvudstad och språk.
En klient med en säkerhetskod ska kunna lägga till nya länder.
En klient med en säkerhetskod ska kunna redigera redan existerande länder.
En klient med en säkerhetskod ska kunna ta bort redan existerande länder.
Ni måste använda minst en route.
Ni måste ha validering för varje endpoint (Går bra att täcka flera endpoints med en middleware).
Era endpoints måste svara med relevanta statuskoder och meddelanden.
*/

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE
}

const pool = mysql.createPool(config);


server.get("/", (req, res) => {

  const {country} = req.body;
  
  const exists = `
  SELECT EXISTS(SELECT * FROM countryData WHERE Country = '${country}')`;

  pool.query(exists, (error, result) => {

    if (error) {
      res.sendStatus(500);
    } else {

    if(Object.values(result[0])[0] === 0) {

    console.log("nej");
    res.status(404).json('Country does not exist in database');
    return;
    }
    
    const sql = `
    SELECT * FROM countryData WHERE Country = '${country}'`
  
    pool.query(sql, (error, result) => {
      
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        res.status(200).send(result);
      }
  })
    }
  })
});


server.post("/addCountry", (req, res) => {
  
});

server.listen(5050);
