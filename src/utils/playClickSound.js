// utils/playClickSound.js
const soundMap = {
  handButton: "big-button.mp3",
  checkButton: "check-button.mp3",
  clickButton: "click-button.mp3",
  menuButton: "menu-button.mp3"


};

export const playClickSound = (type) => {
  // Check if sound is enabled in localStorage
  const soundEnabled = localStorage.getItem("soundEnabled") !== "false";

  if (!soundEnabled) return; // Do nothing if sound is off

  const fileName = soundMap[type] || soundMap.big;
  const audio = new Audio(`/sound/${fileName}`);
  audio.volume = 0.5;
  audio.play().catch(err => console.log("Sound play error:", err));
};
