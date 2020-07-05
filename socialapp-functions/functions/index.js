const functions = require('firebase-functions');
const admin = require('firebase-admin');

const express = require('express');
const app = express();

admin.initializeApp();

const firebaseConfig = {
    apiKey: "AIzaSyBqkdmZ6GBLxchSibnPaYbvkFzP2swZ_Z4",
    authDomain: "socialapp-ab3d1.firebaseapp.com",
    databaseURL: "https://socialapp-ab3d1.firebaseio.com",
    projectId: "socialapp-ab3d1",
    storageBucket: "socialapp-ab3d1.appspot.com",
    messagingSenderId: "691341990119",
    appId: "1:691341990119:web:821c498761bf3645a12a42",
    measurementId: "G-YLDWL5DHZS"
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/screams', (req, res) => {
    db.collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = [];
            data.forEach(doc => {
                screams.push({
                    screamId : doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(screams);
        })
        .catch(err => console.log(err));
});

app.post('/scream',(req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle : req.body.userHandle,
        createdAt : new Date().toISOString()
    };

    db.collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({message: `document ${doc.id} created successfully`});
        })
        .catch(err => {
            res.status(500).json({error : 'something went wrong'});
            console.log(err);
        });
});

// signout route

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    // TODO valifdate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists) {
                return res.status(400).json({handle: `this handle is already exist`});
            }
            else {
                return firebase
                .auth()
                .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            db.doc(`/users/${newUser.handle}`).set(userCredentials)
                .then(() => {
                    return res.status(201).json({token});
                });
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/email-already-in-use') {
                return res.status(400).json({email : 'Email is already in use'});
            }
            else{
                return res.status(500).json({error: err.code});
            }
        });

    // firebase
    //     .auth()
    //     .createUserWithEmailAndPassword(newUser.email, newUser.password)
    //     .then(data => {
    //         return res.status(201).json({message: `user ${data.user.uid} signup successfully`});
    //     })
    //     .catch(err => {
    //         console.error(err);
    //         return res.status(500).json({error : err.code});
    //     });
});

exports.api = functions.https.onRequest(app);