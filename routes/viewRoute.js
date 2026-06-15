const express = require('express');
const router = express.Router();
const Paste = require('../model/pasteDB');

router.get('/', (req, res) => {
    res.render('index'); 
});

router.get('/:shortId', async (req, res) => {
    try {
        const paste = await Paste.findOne({ shortId: req.params.shortId });
        
        if (!paste) {
            return res.status(404).send('Paste not found or expired.');
        }
        
        res.render('paste', { paste: paste }); 
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;