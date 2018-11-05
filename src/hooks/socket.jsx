import Socket from '../socket';

let socket;

export default function () {
  if (!socket) {
    socket = new Socket();
  }
  return socket;
}
