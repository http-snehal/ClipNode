const express = require("express");
const mongoose = require("mongoose");
const {pasteHandle} = require("../controllers/pasteLog");
const paste = require("../model/pasteDB");

const router = express.Router();

router.post("/paste", pasteHandle);

module.exports = router ;

