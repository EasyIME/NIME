'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const uuid       = require('uuid');
const debug      = require('debug')('nime:server');

const {
  initService,
  handleRequest
} = require('./requestHandler');

const {
  makeDir,
  writeFile
} = require('./util');

const statusDir  = `${process.env.LOCALAPPDATA}/PIME/status`;
const statusFile = `${statusDir}/node.json`;

function isAuthenticated(req, httpBasicAuth) {
  return req.get('Authentication') === httpBasicAuth;
}

function createServer(dllPath, services = []) {

  const app = express();
  const accessToken = uuid.v4();
  const userPass = `PIME:${accessToken}`;
  const httpBasicAuth = `Basic ${new Buffer.from(userPass).toString('base64')}`;
  const connections = {};

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

    connections[client_id] = {service: null, state: null};
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
      connections[clientId] = {service, state}
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

    app.listen(3000, '127.0.0.1');
    debug('Wait connection');

    const info = {
      pid: process.pid,
      port: 3000,
      access_token: accessToken
    };

    writeFile(statusFile, JSON.stringify(info));
  }
  return {listen};
}

module.exports = {
  createServer
};
