const BattleStreams = require('./battle-stream');
const BattleClient = require('./battle-stream-client');
const Dex = require('./dex');

var http = require('http');
var sockjs = require('sockjs');

var simServer = sockjs.createServer()

simServer.on('connection', function(conn) {
  conn.on('data', function(message) {
    const streams = BattleStreams.getPlayerStreams(
        new BattleStreams.BattleStream());
    const p1 = new BattleClient.BattleStreamClient(streams.p1, conn);
    //const p2 = new BattleClient.BattleStreamClient(streams.p2, conn);

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
    //(async () => {
      //let chunk;
      //while ((chunk = streams.omniscient.read())) {
        //console.log(chunk)
      //}
    //})();
    streams.omniscient.write(`>start ${JSON.stringify(spec)}`);
    streams.omniscient.write(`>player p1 ${JSON.stringify(p1spec)}`);
    streams.omniscient.write(`>player p2 ${JSON.stringify(p2spec)}`);
    console.log("STARTED BATTLE")
  });
  conn.on('close', function() {});
});

function startBattle() {
  const streams = BattleStreams.getPlayerStreams(
    new BattleStreams.BattleStream());
  return [streams.p1, streams.p2, streams.omniscient];
}

var server = http.createServer();
simServer.installHandlers(server, {prefix: '/sim'});
server.listen(8000, '0.0.0.0')
