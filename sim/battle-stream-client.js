const BattleStreams = require('./battle-stream');

function randomElem(array) {
	return array[Math.floor(Math.random() * array.length)];
}

class BattleStreamClient extends BattleStreams.BattlePlayer {
	/**
	 * @param {AnyObject} request
	 */
  constructor(playerStream, conn, debug = false) {
    super(playerStream, debug)
    this.conn = conn;
  }

	receiveRequest(request) {
    if (request.wait) {
      // wait request
      // do nothing
    } else if (request.forceSwitch) {
      // switch request
      const pokemon = request.side.pokemon;
      let chosen = /** @type {number[]} */ ([]);
      const choices = request.forceSwitch.map((/** @type {AnyObject} */ mustSwitch) => {
        if (!mustSwitch) return `pass`;
        let canSwitch = [1, 2, 3, 4, 5, 6];
        canSwitch = canSwitch.filter(i => (
          // not active
          i > request.forceSwitch.length &&
          // not chosen for a simultaneous switch
          !chosen.includes(i) &&
          // not fainted
          !pokemon[i - 1].condition.endsWith(` fnt`)
        ));
        const target = randomElem(canSwitch);
        chosen.push(target);
        return `switch ${target}`;
      });
      console.log(choices.join(`, `));
      this.choose(choices.join(`, `));
    } else if (request.active) {
      // move request
      const choices = request.active.map((/** @type {AnyObject} */ pokemon, /** @type {number} */ i) => {
        if (request.side.pokemon[i].condition.endsWith(` fnt`)) return `pass`;
        let canMove = [1, 2, 3, 4].slice(0, pokemon.moves.length);
        canMove = canMove.filter(i => (
          // not disabled
          !pokemon.moves[i - 1].disabled
        ));
        const move = randomElem(canMove);
        const targetable = request.active.length > 1 && ['normal', 'any'].includes(pokemon.moves[move - 1].target);
        const target = targetable ? ` ${1 + Math.floor(Math.random() * 2)}` : ``;
        //return `move ${move}${target}`;
      });
      //this.choose(choices.join(`, `));
    } else {
      // team preview?
      this.choose(`default`);
    }
  }
}


module.exports = {
  BattleStreamClient
};
