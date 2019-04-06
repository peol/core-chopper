import { useState, useEffect } from 'react';

export default function usePlayerList(socket, deps = []) {
  const [playerList, setPlayerList] = useState([]);
  useEffect(() => {
    socket.on('player:listed', setPlayerList);
    return () => socket.off('player:listed', setPlayerList);
  }, [socket]);
  useEffect(() => socket.send({ type: 'player:list' }), [socket, deps]);
  return playerList;
}
