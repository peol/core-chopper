import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Toggle from 'react-toggle';

import usePlayerList from '../hooks/player-list';
import useFormValue from '../hooks/form-value';

import 'react-toggle/style.css';
import './player.css';

function Form({ player, list, socket }) {
  const [formPlayer, setFormPlayer] = useState(player);
  const [name, setName] = useFormValue(formPlayer.name);
  const [email, setEmail] = useFormValue(formPlayer.email);
  const [contact, setContact] = useFormValue(formPlayer.contact);
  const confirm = () => {
    const newPlayer = Object.assign({}, formPlayer, {
      name: name.trim(),
      email: email.trim(),
      contact,
    });
    if (newPlayer.name) {
      socket.send({ type: 'player:save', data: newPlayer });
    }
  };
  const options = list.map((p) => {
    let label = p.name;
    if (p.email) label += `(${p.email.slice(0, 3)}...@...${p.email.slice(-5)})`;
    return { label, value: p.userid };
  });

  useEffect(() => {
    setName(formPlayer.name);
    setEmail(formPlayer.email);
    setContact(formPlayer.contact);
  }, [formPlayer]);

  return (
    <ul className="details">
      <li>
        <Select
          className="select"
          options={options}
          placeholder="New player"
          _value={formPlayer.userid}
          onChange={o => setFormPlayer(list.find(p => p.userid === o.value))}
        />
      </li>
      <li>
        <label htmlFor="name">
          Name:
          <input id="name" value={name} onChange={setName} />
        </label>
      </li>
      <li>
        <label htmlFor="email">
          Email:
          <input id="email" value={email} onChange={setEmail} />
        </label>
      </li>
      <li>
        <label htmlFor="contact">
          Contact after event:
          <Toggle id="contact" checked={contact} onChange={setContact} />
        </label>
      </li>
      <li><span className="button" onClick={confirm}>Confirm</span></li>
    </ul>
  );
}

function CreateGame({ player, socket }) {
  const create = () => socket.receive(JSON.stringify({ type: 'player:saved', data: player }));
  return (
    <h2 onClick={create}>
Welcome,
      {' '}
      <span>{player.name}</span>
! Scan your card or click here again to play!
    </h2>
  );
}

export default function Player({ player, socket }) {
  const playerList = usePlayerList(socket);
  const [showForm, setShowForm] = useState(false);
  let view;

  if (!showForm && !player.userid) {
    view = (<h2 onClick={() => setShowForm(true)}>Scan your card or click to begin!</h2>);
  } else if (!player.userid || !player.name) {
    view = (<Form player={player} list={playerList} socket={socket} />);
  } else {
    view = (<CreateGame player={player} socket={socket} />);
  }
  return (<div className="card player">{view}</div>);
}
