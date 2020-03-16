# Object Detection API Demo

## Train a model

To train a deployable object detection model, run:

```
 cacli train --frameworkv 1.15 --script https://github.com/cloud-annotations/training/releases/download/v1.2.30/deployable.zip
```

## Deploy the model
Once training has finished, run the following to store the model:
```
ibmcloud ml store training-runs <CACLI-MODEL-ID>
```

You should get the following output:
```
Starting to store the training-run '<CACLI-MODEL-ID>' ...
OK
Model store successful. Model-ID is '18510cf7-2a9b-4677-9280-b4604e2e10cb'.
```

Use the returned information to run the `deploy` command:
```
ibmcloud ml deploy 18510cf7-2a9b-4677-9280-b4604e2e10cb <CHOOSE-A-DEPLOYMENT-NAME>
```

You should get a response back with a `scoring endpoint`

## Setup
Clone the repo:
```
git clone https://github.com/cloud-annotations/wml-api-demo
cd wml-api-demo
```

Create a `.env` file with the following information:
```
APIKEY=<YOUR-WML-APIKEY>
SCORING_ENDPOINT=<YOUR-SCORING_ENDPOINT>
```

Install the dependencies:
```
npm install
```


Run the app:
```
npm start
```
