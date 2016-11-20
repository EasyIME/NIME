'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const fs         = require('fs');
const uuid       = require('uuid');

let textService = require('./textService');
let debug       = require('debug')('nime:server');

const statusDir  = `${process.env.LOCALAPPDATA}/PIME/status`;
const statusFile = `${statusDir}/node.json`;

function makeDir(path) {

  const paths = path.split('/');
  const entries = [];
  paths.reduce((entry, tmp) => {
    entries.push(entry);
    return `${entry}/${tmp}`
  });

  entries.push(path);

  entries.forEach(entry => {
    try {
      const stats = fs.statSync(entry);
      if (!stats.isDirectory()) {
        fs.mkdirSync(entry);
      }
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        fs.mkdirSync(entry);
      }
    }
  })
}

function isAuthenticated(req, httpBasicAuth) {
  return req.get('Authentication') === httpBasicAuth;
}

function initService(request, services) {
  let response = {success: false, seqNum: request['seqNum']};
  let service = null;
  let state = {
    env: {}
  };

  if (typeof services === 'function') {
    // Let user handle services
    service = services(request);
  } else {
    // Search the service
    services.forEach((tmpService) => {
      if (tmpService['guid'].toLowerCase() === request['id'].toLowerCase()) {
        service = tmpService['textService'];
      }
    });
  }

  // Store environment
  state.env['id']              = request['id'];
  state.env['isWindows8Above'] = request['isWindows8Above'];
  state.env['isMetroApp']      = request['isMetroApp'];
  state.env['isUiLess']        = request['isUiLess'];
  state.env['isConsole']       = request['isConsole'];

  if (service !== null) {
    // Use the text reducer to change state
    state    = service.textReducer(request, state);
    // Handle response
    response = service.response(request, state);
  } else {
    state    = {};
    response = {success: false, seqNum: request['seqNum']};
  }

  return {service, state, response};
}

function handleRequest(request, {state, service = null}) {
  let response = {success: false, seqNum: request['seqNum']};

  if (request['method'] === 'onActivate') {
    state.env['isKeyboardOpen'] = request['isKeyboardOpen'];
  }

  if (service !== null) {
    // Use the text reducer to change state
    state    = service.textReducer(request, state);
    // Handle response
    response = service.response(request, state);
  } else {
    state    = {};
    response = {success: false, seqNum: request['seqNum']};
  }

  return {state, response};
}

function createServer(dllPath, services = [{guid: '123', textService}]) {

  const app = express();
  const accessToken = uuid.v4();
  const userPass = `PIME:${accessToken}`;
  const httpBasicAuth = `Basic ${new Buffer.from(userPass).toString('base64')}`;
  let connections = {};
  let id = 0;
  let storeState = {
    env: {}
  };
  let response = {};

  makeDir(`${process.env.LOCALAPPDATA}/PIME/status`);

  app.use(bodyParser.json({
    type: () => true
  }));

  app.post('/', (req, res) => {
    debug("start");

    if (!isAuthenticated(req, httpBasicAuth)) {
      debug('Authenticate not match');
      res.send('');
    }

    const client_id = uuid.v4();

    connections[client_id] = {
      service: null,
      state: null
    };
    debug(connections);
    res.send(client_id);
  });

  app.post('*', (req, res) => {

    if (!isAuthenticated(req, httpBasicAuth)) {
      debug('Authenticate not match');
      res.send('');
      return;
    }

    const clientId = req.path.slice(1);
    const request  = req.body;

    debug(clientId);
    debug(request);

    if (!connections.hasOwnProperty(clientId)) {
      debug(`Connection not found ${clientId}`);
      res.send('');
      return;
    }

    if (request['method'] === 'init') {

      let {service, state, response} = initService(request, services);
      connections[clientId].service = service;
      connections[clientId].state = state;
      debug(response);
      res.send(JSON.stringify(response));
      return;

    } else {

      let {state, response} = handleRequest(request, connections[clientId]);
      connections[clientId].state = state;
      debug(response);
      res.send(JSON.stringify(response));
      return;
    }
  });

  function listen() {

    const info = {
      pid: process.pid,
      port: 3000,
      access_token: accessToken
    };

    fs.writeFile(statusFile, JSON.stringify(info), (err) => {
      if (err) {
        throw err;
      }
      app.listen(3000, '127.0.0.1');
      debug('Wait connection');
    });
  }
  return {listen};
}


module.exports = {
  createServer
};
