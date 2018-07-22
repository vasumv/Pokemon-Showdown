const BattleStreams = require('./battle-stream');
const BattleClient = require('./battle-stream-client');
const Dex = require('./dex');
const BattleStreamExample = require('./battle-stream-example');

var http = require('http');
var sockjs = require('sockjs');

class SimServer {

  constructor() {
    var simServer = this
    this.httpServer = http.createServer()
    this.simServer = sockjs.createServer();
    this.simServer.installHandlers(this.httpServer, {prefix: '/sim'});
    this.p1stream = null;
    this.p2stream = null;
    this.simServer.on('connection', function(conn) {
      conn.on('data', function(message) {
        simServer.handleMessage(message, conn);
      });
      conn.on('close', function() {});
    });
    this.httpServer.listen(8000, '0.0.0.0');
  }

  async listen(conn) {
    let chunk;
    while ((chunk = await this.omniscient.read())) {
      conn.write(chunk);
    }
  }

  handleMessage(message, conn) {
    console.log("GOT MESSAGE: " + message);
    if (message.includes('start')) {
      this.startBattle(conn);
    } else if (message.includes('move')) {
      console.log("Client sent move: " + message);
      this.p1stream.choose(message)
    } else {
      console.log("INVALID MESSAGE")
    }
  }

  startBattle(conn) {
    const streams = BattleStreams.getPlayerStreams(
        new BattleStreams.BattleStream());
    this.p1stream = new BattleClient.BattleStreamClient(streams.p1, conn);
    this.p2stream = new BattleStreamExample.RandomPlayerAI(streams.p2);
    this.omniscient = streams.omniscient;
    const spec = {
      formatid: "gen7customgame",
    };
    const p1spec = {
      name: "Bot 1",
      team: Dex.packTeam(Dex.generateTeam('gen7randombattle')),
    };
    const p2spec = {
      name: "Bot 2",
      team: Dex.packTeam(Dex.generateTeam('gen7randombattle')),
    };
    this.omniscient.write(`>start ${JSON.stringify(spec)}`);
    this.omniscient.write(`>player p1 ${JSON.stringify(p1spec)}`);
    this.omniscient.write(`>player p2 ${JSON.stringify(p2spec)}`);
    this.listen(conn);
  }
}

var simServer = new SimServer()

module.exports = {
  SimServer
}
