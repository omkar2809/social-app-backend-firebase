const functions = require('firebase-functions');
const express = require('express');
const app = express();

const {getAllScreams, postOneScream, getScream} = require('./handles/screams');
const {signup, login, uploadImage, addUserDetails, getAuthenticatedUser} = require('./handles/users');
const FBAuth = require('./util/FBAuth');

app.get('/screams', getAllScreams);
app.post('/scream',FBAuth, postOneScream);
app.get('/scream/:screamId',getScream);

app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);