const http = require('http');
const parser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { createTerminus } = require('@godaddy/terminus');
const express = require('express');
const ngrok = require('ngrok');
const cache = require('./model');

require('dotenv').config();

const { AgencyServiceClient, Credentials } = require("@streetcred.id/service-clients");
const client = new AgencyServiceClient(new Credentials(process.env.ACCESSTOK, process.env.SUBKEY), { noRetryPolicy: true });

let app = express();
app.use(cors());
app.use(parser.json());
app.use(express.static(path.join(__dirname, 'build')))

app.get('*', function (req, res) {
    console.log(process.env)
    res.sendFile(path.join(__dirname, '/build/index.html'));
});

// WEBHOOK ENDPOINT
/* app.post('/webhook', async function (req, res) {
    try {
        console.log("got webhook" + req + "   type: " + req.body.message_type);
        if (req.body.message_type === 'new_connection') {
            console.log("new connection notif");
            console.log("Connection Complete with connectionid : " + req.body.object_id);

        }

    }
    catch (e) {
        console.log("Error in creating a connection ");
        console.log(e.message || e.toString());
    }
}); */

//FRONTEND ENDPOINT for creating a connection
app.post('/api/connection', cors(), async function (req, res) {
    const invite = await getInvite();
    console.log("invite.connectionId : " + invite.connectionId);
    console.log("invite.inviteurl: " + invite.invitationUrl);
    console.log("invite.invitation :" + invite.invitation);


    res.status(200).send({
        invite_url: invite.invitationUrl,
        connectid: invite.connectionId
        // holder_did: invite.hasOwnProperty('myDid') ? invite.myDid : '',
        // issuer_did: invite.hasOwnProperty('theirDid') ? invite.theirDid : ''
    });

});

const getConnection = async (connectionId) => {
    try {
        return await client.getConnection(connectionId);
    } catch (e) {
        console.log("Get connection problem");
        console.log(e.message || e.toString());
        return false;
    }
}

const getInvite = async () => {
    try {
        return await client.createConnection({
            connectionInvitationParameters: {}
        });
    } catch (e) {
        console.log("Get invite problem");
        console.log(e.message || e.toString());
    }
}

// //FRONTEND ENDPOINT for issuing credentials for Covid19test
app.post('/api/issue', cors(), async function (req, res) {
    const attribs = JSON.stringify(req.body);
    console.log("attribs in app.post" + attribs);
    let param_obj = JSON.parse(attribs);
    const connectid = param_obj["cid"];
    console.log()
    console.log("We are starting the credentials part");
    let params = {
        credentialOfferParameters: {
            definitionId: process.env.CRED_DEF_ID_COVIDVC,
            connectionId: connectid,
            automaticIssuance: true,
            credentialValues: {
                "testdate": param_obj["covid19testdata"]["testdate"],
                "healthclinic": param_obj["covid19testdata"]["healthclinic"],
                "citizen": param_obj["covid19testdata"]["citizen"],
                "statehealth": param_obj["covid19testdata"]["statehealth"],
                "testtype": param_obj["covid19testdata"]["testtype"],
                "testnumber": param_obj["covid19testdata"]["testnumber"],
                "testresult": param_obj["covid19testdata"]["testresult"],
                "locationstate": param_obj["covid19testdata"]["locationstate"]

            }
        }
    }
    console.log(params);
    console.log("Client.createCredential");
    await client.createCredential(params);
    console.log("End of the Credential");
    console.log("  ");
    res.status(200).send("Credentials Sent");

});






// //FRONTEND ENDPOINT for issuing credentials for Covid19 Vaccine
app.post('/api/issuevaccine', cors(), async function (req, res) {
    const attribs = JSON.stringify(req.body);
    console.log("attribs in app.post" + attribs);
    let param_obj = JSON.parse(attribs);
    const connectid = param_obj["cid"];
    console.log()
    console.log("We are starting the credentials part");
    let params = {
        credentialOfferParameters: {
            definitionId: process.env.CRED_DEF_ID_VACCINEVC,
            connectionId: connectid,
            automaticIssuance: true,
            credentialValues: {
                "vaccinedate": param_obj["vaccinedata"]["vaccinedate"],
                "healthclinic": param_obj["vaccinedata"]["healthclinic"],
                "citizen": param_obj["vaccinedata"]["citizen"],
                "statehealth": param_obj["vaccinedata"]["statehealth"],
                "vaccinetype": param_obj["vaccinedata"]["vaccinetype"],
                "vaccinenumber": param_obj["vaccinedata"]["vaccinenumber"],

            }
        }
    }
    console.log(params);
    console.log("Client.createCredential");
    let response = await client.createCredential(params);
    console.log("Credential Response : " + JSON.stringify(response));
    console.log("End of the Credential");
    console.log("  ");
    res.status(200).send({
        status: "credential sent",
        VCresponseMessage: response
    });

});

// //FRONTEND ENDPOINT for issuing credentials for ImmunityVC
app.post('/api/immunityvc', cors(), async function (req, res) {
    const attribs = JSON.stringify(req.body);
    console.log("attribs in app.post" + attribs);
    let param_obj = JSON.parse(attribs);
    const connectid = param_obj["cid"];
    console.log()
    console.log("We are starting the credentials part");
    let params = {
        credentialOfferParameters: {
            definitionId: process.env.CRED_DEF_ID_IMMVC,
            connectionId: connectid,
            automaticIssuance: true,
            credentialValues: {
                "vc_schema": param_obj["immunityvc"]["vc_schema"],
                "vcdate": param_obj["immunityvc"]["vcdate"],
                "authorizedby": param_obj["immunityvc"]["authorizedby"],
                "citizen": param_obj["citizen"],
                "testdate": param_obj["testdate"],
                "testresult": param_obj["testresult"],
                "vc_message": param_obj["immunityvc"]["vc_message"]
            }
        }
    }

    console.log(params);
    console.log("Client.createCredential");
    let response = await client.createCredential(params);
    console.log("Credential Response : " + JSON.stringify(response));
    console.log("End of the Credential");
    console.log("  ");
    console.log("createCredential Response" + JSON.stringify(res));
    res.status(200).send({
        status: "credential sent",
        VCresponseMessage: response
    });


});




// for graceful closing
let server = http.createServer(app);

async function onSignal() {
    let webhookId = cache.get("webhookId");
    const p1 = await client.removeWebhook(webhookId);
    return Promise.all([p1]);
}
createTerminus(server, {
    signals: ['SIGINT', 'SIGTERM'],
    healthChecks: {},
    onSignal
});

const PORT = process.env.PORT || 3002;
server = server.listen(PORT/* , async function () {
    const url_val = await ngrok.connect(PORT);
    console.log("============= \n\n" + url_val + "\n\n =========");
    let response = await client.createWebhook({
        webhookParameters: {
            url: url_val + "/webhook",  // process.env.NGROK_URL
            type: "Notification"
        }
    });

    cache.add("webhookId", response.id);
    console.log('Listening on port %d', server.address().port);
} */); 
