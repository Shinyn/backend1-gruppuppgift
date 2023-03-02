const express = require("express");
const dotenv = require('dotenv').config();
const mysql = require('mysql2');
const { country } = require("./server");
const server = express();
const joi = require("joi");

server.use(express.json());



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
  SELECT EXISTS(SELECT * FROM countryData WHERE Country = ?)`;

  pool.query(exists, [country], (error, result) => {

    if (error) {
      res.sendStatus(500);
    } else {

    if(Object.values(result[0])[0] === 0) {

    console.log("nej");
    res.status(404).json('Country does not exist in database');
    return;
    }
    
    const sql = `
    SELECT * FROM countryData WHERE Country = ?`
  
    pool.query(sql, [country], (error, result) => {
      
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
  const {password} = req.body;

  // Country, Capital, Population, mainLanguage
  const sql = `INSERT INTO countryData VALUES ('Norge', 'Oslo', 20000000, 'Norska')`;
  
  const schema = joi.object({
    password: joi.string().min(8).max(25).required()
});

const validation = schema.validate(req.body);

});
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


server.put('/edit', (req, res) => {
  const {country, capital, population, mainLanguage} = req.body;

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
    DELETE FROM countryData WHERE Country = '${country}'`
  
    pool.query(sql, (error, result) => {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        res.status(200).send(`${country} was edited!`);
      }
  })
    }
  })
})



server.delete('/delete', (req, res) => {
  const {country} = req.body;

  const exists = `
  SELECT EXISTS(SELECT * FROM countryData WHERE Country = ?)`;

  pool.query(exists, [country], (error, result) => {

    if (error) {
      res.sendStatus(500);
    } else {

    if(Object.values(result[0])[0] === 0) {

    console.log("nej");
    res.status(404).json('Country does not exist in database');
    return;
    }
    
    const sql = `
    DELETE FROM countryData WHERE Country = ?`
  
    pool.query(sql, [country], (error, result) => {
      
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        res.status(200).send(`${country} was deleted from the database!`);
      }
  })
    }
  })
})

server.listen(5050);
