//Copyright Daniel Gray 2018. See LICENCE.MD
//2fa demo app, including generating and checking the 2fa code.


const tfa = require("2fa"),
    express = require("express"),
    app = express(),
    bodyParser = require('body-parser');

let qrcode;
let validcode;

var tfaopts = {
    // the number of counters to check before what we're given
    // default: 0
    beforeDrift: 2,
    // and the number to check after
    // default: 0
    afterDrift: 2,
    // if before and after drift aren't specified,
    // before + after drift are set to drift / 2
    // default: 0
    drift: 4,
    // the step for the TOTP counter in seconds
    // default: 30
    step: 30
};
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({
    limit: '20mb'
}));
app.use(bodyParser.urlencoded({
    limit: '20mb',
    extended: false
}));
//Make a 2FA code
app.get('/makecode', async(req, res, next) => {
    try {
        tfa.generateKey(32, function(err, key) {
            //Store the key that we use to verify the 2fa 
            validcode = key;
            //Generate a easy to use QR code the user can scan with their 2fa app
            tfa.generateGoogleQR('COMPANY', 'user@email.com', key, (function(err, qr) {
                qrcode = qr
                res.render("index", {
                    qrcode: `<img src="${qrcode}">`
                })
            }))
        })
    } catch (e) {
        next(e)
    }

})

app.get('/checkcode', async(req, res, next) => {
        try {
            res.render('checkcode', {

            })
        } catch (e) {
            next(e);
        }
    })
    //Example login with 2fa
app.post('/checkcode', async(req, res, next) => {
    try {
        //Verify the 2fa for the user with the code they generated with the code we generated, along with some options.
        var validTOTP = tfa.verifyTOTP(validcode, req.body.key, tfaopts)
            //Returns true if 2fa matches.
        if (validTOTP === true) {
            res.send("Verified")
        } else {
            res.send("bad")
        }
    } catch (e) {
        next(e);
    }
})
app.listen(8080)