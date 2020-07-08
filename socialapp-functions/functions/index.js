const functions = require('firebase-functions');
const express = require('express');
const app = express();

const {getAllScreams, postOneScream} = require('./handles/screams');
const {signup, login, uploadImage} = require('./handles/users');
const FBAuth = require('./util/FBAuth');

app.get('/screams', getAllScreams);
app.post('/scream',FBAuth, postOneScream);
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);