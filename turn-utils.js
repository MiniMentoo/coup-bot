function endTurn(action, serverId, players) {
    let turn = (global.turns.get(serverId) + 1) % players.length;
    global.turns.set(serverId, turn);
    action.followUp({content: `${players[turn]} it's your turn, do /turn to take it`});
}



module.exports = {
    endTurn
};