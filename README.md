## Goal of this API
The goal of this API is to connect with the frontend portion of this app (https://github.com/patebry/pate-citibot2.git) to create, show, edit, list, and delete cities from the Citibot database.

## Cloning the Repo
First change into the directory you want this application to be stored in

Next in the terminal run the code (git needs to be installed)

```
git clone https://github.com/patebry/pate-citibot-api.git (directory name)
```

This will clone the repository into the (directory name) you choose

Now change directories with the code cd (directory name)

## Dependencies
To install all of the dependencies run `yarn install` or `npm install -S` This will add all of the dependencies in a `package.json` file

## Setting up the .env file
This is where all secrets can be kept. The `.env` file can be created in the general directory for this app. once created copy this into it.

```
COUCHDB_URL=
TWILIO_SID=
TWILIO_TOKEN=
TRELLO_KEY=
TRELLO_TOKEN=

```

Fill in all of the keys with the values you want them to have. `COUCHDB_URL` is the database url. The Twilio and Trello keys can be found in your accounts for both applications

## Starting the API

run the command `yarn start` or `npm start` once the .env file has been created and set up to start the API on port 4000

This port can be changed in `app.js` under `const port`

This API will not be much use if it is connected to the frontend part of this app which can be cloned from Github at https://github.com/patebry/pate-citibot2.git
