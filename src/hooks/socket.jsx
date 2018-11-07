import Socket from '../socket';

let socket;

export default function useSocket() {
  if (!socket) {
    socket = new Socket();
  }
  return socket;
}
