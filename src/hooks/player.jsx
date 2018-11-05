import { useEffect, useState } from 'react';

export default function (socket) {
  const [player, setPlayer] = useState({ userid: null, cardid: null, name: '' });

  useEffect(() => {
    const update = newPlayer => setPlayer(newPlayer);
    socket.on('player:saved', update);
    socket.on('player:scanned', update);
    return () => {
      socket.off('player:saved', update);
      socket.off('player:scanned', update);
    };
  }, []);

  return player;
}
