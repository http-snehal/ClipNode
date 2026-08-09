const express = require('express');
const router = express.Router();
const Paste = require('../model/pasteDB');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, (req, res) => {
    res.render('index'); 
});

// Raw paste viewer endpoint
router.get('/raw/:shortId', async (req, res) => {
    try {
        const paste = await Paste.findOne({ shortId: req.params.shortId });
        
        if (!paste) {
            return res.status(404).type('text/plain').send('Paste not found or expired.');
        }
        
        res.type('text/plain; charset=utf-8').send(paste.content);
    } catch (error) {
        res.status(500).type('text/plain').send('Server Error');
    }
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