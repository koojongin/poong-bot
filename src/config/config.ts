let isPausedListenCommand = false;
export const isPauseListening = () => {
  return isPausedListenCommand;
};
export function setPauseListening(pause: boolean) {
  isPausedListenCommand = pause;
}
