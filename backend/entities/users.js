const express = require('express');
const cors = require('cors');
const uri = "mongodb://localhost";
const dbName = "ma-base"; 
const collectionName = "utilisateurs";
const {MongoClient} = require('mongodb');

class Users {
    constructor(client) {
      this.client = client
      client.connect();
    }
  
    create(login, password, lastname, firstname) {
      return new Promise((resolve, reject) => {
        const result = collectionName.insertOne({login,password,lastname,firstname});
        let userid = result.id; 
         // À remplacer par une requête bd
        if(false) {
          //erreur
          reject();
        } else {
          resolve(userid);
        }
      });
    }
  
    get(userid) {
      return new Promise((resolve, reject) => {
        const user = {
           login: "pikachu",
           password: "1234",
           lastname: "chu",
           firstname: "pika"
        }; // À remplacer par une requête bd
  
        if(false) {
          //erreur
          reject();
        } else {
          if(userid == 1) {
            resolve(user);
          } else {
            resolve(null);
          }
        }
      });
    }
  
    async exists(login) {
      return new Promise((resolve, reject) => {
        if(false) {
          //erreur
          reject();
        } else {
          resolve(true);
        }
      });
    }
  
    checkpassword(login, password) {
      return new Promise((resolve, reject) => {
        let userid = 1; // À remplacer par une requête bd
        if(false) {
          //erreur
          reject();
        } else {
          resolve(userid);
        }
      });
    }
  
  }
  
  exports.default = Users;
  
  