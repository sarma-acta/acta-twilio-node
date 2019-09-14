var express = require('express');
var router = express.Router();
// var Ticket = require('../models/ticket');

// // POST /tickets/new
// router.post('/new', function (req, res) {
//   var phoneNumber = req.body.phone_number;
//   var createdAt = new Date();

//   if (!description || !phoneNumber || !name) {
//     return res.status(400).send('name, description and phoneNumber fields are required.')
//   }
//   Ticket.create({ phoneNumber: phoneNumber, createdAt: createdAt })
//     .then(function (savedTicket) {
//       req.flash('success', 'Your ticket was submitted! An agent will call you soon.');
//       return res.status(201).end();
//     })
//     .catch(function (err) {
//       req.flash('errors', 'Failed to create new ticket');
//     })
// });

module.exports = router;
