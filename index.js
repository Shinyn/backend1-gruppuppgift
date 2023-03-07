const express = require("express");
const dotenv = require("dotenv").config();
const mysql = require("mysql2");
const server = express();
const joi = require("joi");

server.use(express.json());

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
};

const pool = mysql.createPool(config);

server.get("/", (req, res) => {
  const sql = `SELECT * FROM countryData`;

  pool.query(sql, (error, result) => {
    if (error) return res.status(400).send(error);

    res.status(200).send(result);
  });
});

server.get("/country", (req, res) => {
  const schema = joi.object({
    country: joi.string().max(100).required(),
  });

  const validation = schema.validate(req.query);
  if (validation.error) {
    res.status(400).send(validation.error.details[0].message);
    return;
  }

  const { country } = req.query;
  const exists = `SELECT EXISTS(SELECT * FROM countryData WHERE Country = ?)`;

  pool.execute(exists, [country], (error, result) => {
    if (error) {
      res.sendStatus(500);
    } else {
      if (Object.values(result[0])[0] === 0) {
        return res.status(404).json("Country does not exist in database");
      }

      const sql = `SELECT * FROM countryData WHERE Country = ?`;

      pool.execute(sql, [country], (error, result) => {
        if (error) {
          console.log(error);
          res.status(500).send("Could not retrive country");
        } else {
          res.status(200).send(result);
        }
      });
    }
  });
});

server.post("/addCountry", (req, res) => {
  const { password, country, capital, population, mainLanguage } = req.body;

  // if(Object.values(validation)[0].password === process.env.CODE) {
  if (password === process.env.CODE) {
    const schema = joi.object({
      password: joi.required(),
      country: joi.string().max(100).required(),
      capital: joi.string().max(100).required(),
      population: joi.number().required(),
      mainLanguage: joi.string().max(100).required(),
    });

    const validation = schema.validate(req.body);
    if (validation.error) {
      res.status(400).send(validation.error.details[0].message);
      return;
    }
    const exists = `SELECT EXISTS(SELECT * FROM countryData WHERE Country = ?)`;

    pool.execute(exists, [country], (error, result) => {
      if (error) {
        res.sendStatus(500);
      } else {
        if (Object.values(result[0])[0] === 1) {
          res
            .status(400)
            .json(
              `${country} already exists in the database. Please make a patch request if you'd like to update existing data.`
            );
          return;
        }

        const sql = `INSERT INTO countryData (Country, Capital, Population, mainLanguage)
      VALUES (?, ?, ?, ?)`;
        pool.execute(
          sql,
          [country, capital, population, mainLanguage],
          (error, result) => {
            if (error) {
              console.log(error);
              res.status(500).send("All fields must be included");
            } else {
              res.status(201).send(result);
            }
          }
        );
      }
    });
  } else {
    res
      .status(401)
      .send("Unauthorized user. Please make sure password is correct.");
  }
});

server.patch("/edit/capital", (req, res) => {
  const { password, country, capital } = req.body;

  if (password === process.env.CODE) {
    const schema = joi.object({
      password: joi.required(),
      country: joi.string().max(100).required(),
      capital: joi.string().max(100).required(),
    });

    const validation = schema.validate(req.body);
    if (validation.error) {
      res.status(400).send(validation.error.details[0].message);
      return;
    }

    const exists = `
  SELECT EXISTS(SELECT * FROM countryData WHERE Country = ?)`;

    pool.execute(exists, [country], (error, result) => {
      if (error) {
        res.sendStatus(500);
      } else {
        if (Object.values(result[0])[0] === 0) {
          res.status(404).json("Country does not exist in database");
          return;
        }

        const sql = `
    UPDATE countryData
    SET Capital = ?
    WHERE Country = ?`;

        pool.execute(sql, [capital, country], (error, result) => {
          if (error) {
            console.log(error);
            res.status(500).send("Make sure you include country and capital");
          } else {
            res.status(200).send(`${country} was edited!`);
          }
        });
      }
    });
  } else {
    res.status(401).send("Unauthorized user");
  }
});

server.patch("/edit/population", (req, res) => {
  const { password, country, population } = req.body;

  if (password === process.env.CODE) {
    const schema = joi.object({
      password: joi.required(),
      country: joi.string().max(100).required(),
      population: joi.number().required(),
    });

    const validation = schema.validate(req.body);
    if (validation.error) {
      res.status(400).send(validation.error.details[0].message);
      return;
    }
    const exists = `SELECT EXISTS(SELECT * FROM countryData WHERE Country = ?)`;

    pool.execute(exists, [country], (error, result) => {
      if (error) {
        res.sendStatus(500);
      } else {
        if (Object.values(result[0])[0] === 0) {
          console.log("nej");
          res.status(404).json("Country does not exist in database");
          return;
        }

        const sql = `
      UPDATE countryData
      SET Population = ?
      WHERE Country = ?`;

        pool.execute(sql, [population, country], (error, result) => {
          if (error) {
            console.log(error);
            res
              .status(500)
              .send(
                `Couldn't edit. Make sure to include Country and Population.`
              );
          } else {
            res.status(200).send(`${country} was edited!`);
          }
        });
      }
    });
  } else {
    res
      .status(401)
      .send("Unauthorized user. Please make sure password is correct.");
  }
});

server.patch("/edit/language", (req, res) => {
  const { password, country, mainLanguage } = req.body;

  if (password === process.env.CODE) {
    const schema = joi.object({
      password: joi.required(),
      country: joi.string().max(100).required(),
      mainLanguage: joi.string().max(100).required(),
    });

    const validation = schema.validate(req.body);
    if (validation.error) {
      res.status(400).send(validation.error.details[0].message);
      return;
    }
    const exists = `
  SELECT EXISTS(SELECT * FROM countryData WHERE Country = ?)`;

    pool.execute(exists, [country], (error, result) => {
      if (error) {
        res.sendStatus(500);
      } else {
        if (Object.values(result[0])[0] === 0) {
          console.log("nej");
          res.status(404).json("Country does not exist in database");
          return;
        }

        const sql = `
    UPDATE countryData
    SET mainLanguage = ?
    WHERE Country = ?`;

        pool.execute(sql, [mainLanguage, country], (error, result) => {
          if (error) {
            console.log(error);
            res
              .status(500)
              .send(
                `Couldn't edit. Make sure to include Country and mainLanguage.`
              );
          } else {
            res.status(200).send(`${country} was edited!`);
          }
        });
      }
    });
  } else {
    res
      .status(401)
      .send("Unauthorized user. Please make sure password is correct.");
  }
});

server.delete("/delete", (req, res) => {
  const { password, country } = req.body;

  if (password === process.env.CODE) {
    const schema = joi.object({
      password: joi.required(),
      country: joi.string().max(100).required(),
    });

    const validation = schema.validate(req.body);
    if (validation.error) {
      res.status(400).send(validation.error.details[0].message);
      return;
    }
    const exists = `
    SELECT EXISTS(SELECT * FROM countryData WHERE Country = ?)`;
    pool.query(exists, [country], (error, result) => {
      if (error) {
        res.sendStatus(500);
      } else {
        if (Object.values(result[0])[0] === 0) {
          res.status(404).json("Country does not exist in database");
          return;
        }

        const sql = `
      DELETE FROM countryData WHERE Country = ?`;

        pool.query(sql, [country], (error, result) => {
          if (error) {
            console.log(error);
            res.sendStatus(500);
          } else {
            res.status(200).send(`${country} was deleted from the database!`);
          }
        });
      }
    });
  } else {
    res
      .status(401)
      .send("Unauthorized user. Please make sure password is correct.");
  }
});

server.listen(5050);
