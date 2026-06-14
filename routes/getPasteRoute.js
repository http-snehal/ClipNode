const express = require("express");
const mongoose = require("mongoose");
const {getPaste} = require("../controllers/getPaste");
const paste = require("../model/pasteDB");

const router = express.Router();

router.get("/paste/:shortId", getPaste);

module.exports = router ;