import { useEffect, useState } from 'react';

export default function usePlayer(socket) {
  const [player, setPlayer] = useState({
    userid: '', cardid: '', name: '', email: '', contact: false,
  });

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
