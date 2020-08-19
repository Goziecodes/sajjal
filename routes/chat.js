var express = require("express"),
router = express.Router(),
passport = require("passport"),
User = require("../models/user"),
dummyTrans = require("../models/dummyTrans"),
Zeus            = require("../models/zeus"),
crypto = require("crypto"),
nodemailer      = require("nodemailer"),
path            = require("path"),
middleware = require("../middleware");
Chatkit             = require('@pusher/chatkit-server');

    const chatkit = new Chatkit.default(require('../config.js'));
    

router.post('/session/auth', (req, res) => {
    const authData = chatkit.authenticate({ userId: req.query.user_id });
  
    res.status(authData.status).send(authData.body);
  });

  router.post('/session/load', (req, res, next) => {
      console.log("ok na")
    // Attempt to create a new user with the email will serving as the ID of the user.
    // If there is no user matching the ID, we create one but if there is one we skip
    // creating and go straight into fetching the chat room for that user
  
    let createdUser = null;
  
    chatkit
      .createUser({
        id: req.body.email,
        name: req.body.name,
      })
      .then(user => {
        createdUser = user;
  
        getUserRoom(req, res, next, false);
      })
      .catch(err => {
        if (err.error === 'services/chatkit/user_already_exists') {
          createdUser = {
            id: req.body.email,
          };
  
          getUserRoom(req, res, next, true);
          return;
        }
  
        next(err);
      });
  
    function getUserRoom(req, res, next, existingAccount) {
      const name = createdUser.name;
      const email = createdUser.email;
  
      // Get the list of rooms the user belongs to. Check within that room list for one whos
      // name matches the users ID. If we find one, we return that as the response, else
      // we create the room and return it as the response.
  
      chatkit
        .getUserRooms({
          userID: createdUser.id,
        })
        .then(rooms => {
          let clientRoom = null;
  
          // Loop through user rooms to see if there is already a room for the client
          clientRoom = rooms.filter(room => {
            return room.name === createdUser.id;
          });
  
          if (clientRoom && clientRoom.id) {
            return res.json(clientRoom);
          }
  
          // Since we can't find a client room, we will create one and return that.
          chatkit
            .createRoom({
              creatorId: createdUser.id,
              isPrivate: true,
              name: createdUser.id,
              userIds: ['Chatkit-dashboard',createdUser.id],
            })
            .then(room => res.json(room))
            .catch(err => {
              console.log(err);
              next(new Error(`${err.error_type} - ${err.error_description}`));
            });
        })
        .catch(err => {
          console.log(err);
          next(new Error(`ERROR: ${err.error_type} - ${err.error_description}`));
        });
    }
  });


router.get('/chat', (req, res) => {
    res.render("indexx")
    // res.sendFile('index.html', {root: __dirname + '/views'})
    // res.sendFile(path.join(  + "views/a.html"));
    // res.sendFile(__dirname  + "../views/a.html");
    // res.sendFile("/home/ezegod/WORK/visual studio workspace/bank/sajjal-bank/views/a.html");
    // res.sendFile(path.join(__dirname + "/index.html"));
    
  })

  router.get('/adminchat', (req, res) => {
    // res.sendFile('admin.html', {root: __dirname + '/views'})
    res.render("chatadmin.ejs");
})









  module.exports = router;