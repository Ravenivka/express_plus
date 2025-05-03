const express = require('express');
const joi = require('joi');
const app = express();
const sqlite3 = require('sqlite3');

const database = new sqlite3.Database('users.db');
const insert = 'INSERT INTO users (name, surname, age, city) VALUES (?, ?, ?, ?)';
const get_user = database.prepare('SELECT * FROM users where ID = ?');

let UniqueID = 0;

const userScheme = joi.object({
    name: joi.string().min(2).required(),
    surname: joi.string().min(2).required(),
    city : joi.string().min(2),
    age: joi.number().min(0).max(99)
});

app.use(express.json());


app.get('/users' , (req, res) => {
    database.all("SELECT * FROM users", [], (err, rows) => {    
        if (rows.length == 0){
            res.send('Not found');
        } else {
            res.send({rows});
        }
    })    
    
});

app.get('/users/:id' , (req, res) => {     
    database.all("SELECT * FROM users WHERE ID=?", [req.params.id], (err, rows) => { 
        if (rows.length == 0){
            res.send('Not found');
        } else {
            res.send({rows});
        }      
        
    })  ;  
});

app.post('/users' , (req, res) => {
    const result = userScheme.validate(req.body);
    if (result.error) {
        return res.status(400).send({error: result.error.details});
    }
    const values = [req.body.name, req.body.surname, req.body.age, req.body.city] ;
    try {
        database.run(insert, values);
        res.send('success');
    } catch(err) {
        console.log(err);
        res.send('error');
    }   
});

app.put('/users/:id', (req, res) => {    
    const result = userScheme.validate(req.body);
    if (result.error) {
        return res.status(400).send({error: result.error.details});
    }
    database.all("SELECT * FROM users WHERE ID=?", [req.params.id], (err, rows) => { 
        if (rows.length == 0){
            res.send('Not found');
        }         
    })  ;  
    let sql = `UPDATE users
    SET name = ?,
     surname = ?,
     age = ?,
     city = ?
    WHERE ID = ?`;
    const values = [req.body.name, req.body.surname, req.body.age, req.body.city, req.params.id] ;   
    //console.log(values); 
    database.run(sql, values, (err) => {
        if (err) {
            console.log(err);
            return res.status(400).send({error: err.details});
        } else {
            res.send('success');  
        }
        });  
});

app.delete('/users/:id' , (req, res) => {
    let sql = `DELETE FROM users WHERE ID=?`
    database.all("SELECT * FROM users WHERE ID=?", [req.params.id], (err, rows) => { 
        if (rows.length == 0){
            res.send('Not found');
        }         
    })  ; 

    database.run(sql, [req.params.id], (err) => {
        if (err) {
            console.log(err);
            return res.status(400).send({error: err.details});
        } else {
            res.send('success');  
        }
       
    })
});

app.listen(3000);