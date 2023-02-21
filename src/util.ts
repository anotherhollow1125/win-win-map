export const constructShortcut = (
  e: React.KeyboardEvent<HTMLDivElement>
): string => {
  const shortcut_list = [];
  if (e.altKey) {
    shortcut_list.push("Alt");
  }
  if (e.ctrlKey) {
    shortcut_list.push("Control");
  }
  if (e.shiftKey) {
    shortcut_list.push("Shift");
  }
  /*
  if (e.metaKey) {
    shortcut_list.push("Meta");
  }
  */

  if (shortcut_list.indexOf(e.key) == -1) {
    shortcut_list.push(e.key);
  }

  const shortcut = shortcut_list.join("+");

  return shortcut;
};
