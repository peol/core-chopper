import { useState, useEffect } from 'react';

export default function usePlayerList(socket) {
  const [playerList, setPlayerList] = useState([]);
  useEffect(() => {
    socket.on('player:listed', setPlayerList);
    return () => socket.off('player:listed', setPlayerList);
  }, []);
  useEffect(() => socket.send({ type: 'player:list' }), []);
  return playerList;
}
