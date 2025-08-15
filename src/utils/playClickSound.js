// utils/playClickSound.js

let backgroundMusic = null; // store background music instance

const soundMap = {
  handButton: "big-button.mp3",
  checkButton: "check-button.mp3",
  clickButton: "click-button.mp3",
  menuButton: "menu-button.mp3",
  win: "menu-music.mp3",
  lose: "lose-music.mp3",
  draw: "draw-music.mp3",
  start: "start-music.mp3",
};

export const playClickSound = (type) => {
  const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
  if (!soundEnabled) return;

  const fileName = soundMap[type];
  if (!fileName) return;

  // If it's background music type, store it so we can stop later
  if (["win", "lose", "draw", "start"].includes(type)) {
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
    backgroundMusic = new Audio(`/sound/${fileName}`);
    backgroundMusic.volume = 0.5;
    backgroundMusic.loop = true; // loop for background music
    backgroundMusic.play().catch(err => console.log("Music play error:", err));
  } else {
    const audio = new Audio(`/sound/${fileName}`);
    audio.volume = 0.5;
    audio.play().catch(err => console.log("Sound play error:", err));
  }
};

// Function to stop background music
export const stopMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    backgroundMusic = null;
  }
};
