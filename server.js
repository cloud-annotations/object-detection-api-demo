const path = require("path");
const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

// Set up express.
const app = express();
const port = process.env.PORT || 9000;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

const authenticate = async () => {
  try {
    const response = await axios({
      method: "post",
      url: "https://iam.bluemix.net/oidc/token",
      auth: {
        username: "bx",
        password: "bx"
      },
      data: `apikey=${process.env.APIKEY}&grant_type=urn:ibm:params:oauth:grant-type:apikey`
    });
    return response.data;
  } catch (error) {
    console.error(error.response.data);
  }
};

app.post("/api/detect", async (req, res) => {
  const { access_token } = await authenticate();

  try {
    const response = await axios({
      method: "post",
      url: process.env.SCORING_ENDPOINT,
      headers: {
        Authorization: `Bearer ${access_token}`
      },
      data: {
        values: [req.body]
      }
    });
    res.send(response.data);
  } catch (error) {
    console.error(error.response.data);
    res.end();
  }
});

app.listen(port, () => {
  console.log("listening on port " + port);
});
