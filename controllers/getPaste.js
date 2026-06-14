const Paste = require("../model/pasteDB");
const { customAlphabet } = require("nanoid");

const getPaste = async (req , res) => {
  try{
    const {shortId} = req.params;
    const paste = await Paste.findOne({shortId});
    if(!paste){
      return res.status(404).json({error: "shortId is required"});
    }
    return res.status(200).json(paste);
  }
  catch(error){
    console.log(error);
    res.status(500).json({error: "Internal server error"});
  }
};

module.exports = {
  getPaste,
};