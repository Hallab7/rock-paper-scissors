"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import scissors from '../assets/images/icon-scissors.svg';
import paper from '../assets/images/icon-paper.svg';
import rock from '../assets/images/icon-rock.svg';
import Hand from '../components/hand';
import { motion, AnimatePresence } from "framer-motion";
import { MdCheck } from "react-icons/md";
import { MdLogout } from "react-icons/md";
import GameLoadingScreen from "../components/LoadingState";

import { getCurrentUser, logout } from "../utils/auth-client";
import ProfileMenu from "../components/ProfileMenu";
import { playClickSound, stopMusic } from "../utils/playClickSound";


export default function Home() {
  const [score, setScore] = useState(5);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const [changeLoadingMessage, setChangeLoadingMessage] = useState("");
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [darkMode, setDarkMode] = useState("on");

   const [rank, setRank] = useState([]);
   const [topPlayers, setTopPlayers] = useState([]);
   const [currentUser, setCurrentUser] = useState(null);
  

  const choices = [
  { name: "rock", image: rock, border: "border-[#de3a5a]" },
  { name: "paper", image: paper, border: "border-[#5671f5]" },
  { name: "scissors", image: scissors, border: "border-[#eca922]" },
];

  useEffect(() => {
      const prevPath = sessionStorage.getItem("previousPath");

      if (prevPath === "/login") {
        setChangeLoadingMessage(<div className="text-center">
        <p>Log in</p>
        Successful✅
        <p>
          Please <span className="text-[#5671f5]">Wait...</span>
        </p>
        </div> );
      } else {
        setChangeLoadingMessage(
          <>
            Please <span className="text-[#5671f5]">Wait...</span>
          </>
        );

      }
    }, []);

  useEffect(() => {
  getCurrentUser()
    .then((user) => {
      if (!user) {
        router.push("/landing-page");
      } else {
        setUser(user);
        console.log("Current user:", user);
        setScore(user.score ?? 5);
        setLoading(false);

        // Play start sound after data is loaded
        playClickSound("start");
      }
    })
    .catch(() => {
      router.push("/landing-page");
    });
}, [router]);


useEffect(() => {
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch leaderboard");

        // Set top players
        setTopPlayers(data.topPlayers || []);

        // Get current user (either in topPlayers or outside top)
        const me =
          data.topPlayers.find((p) => p.isCurrentUser) ||
          data.currentUserOutsideTop ||
          null;

        setCurrentUser(me);
        setLeaderboardLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
      const savedMode = localStorage.getItem("theme") || "off";
      setDarkMode(savedMode);
  
      if (savedMode === "on") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }, []);
  
    const toggleDarkMode = () => {
      const newMode = darkMode === "on" ? "off" : "on";
      setDarkMode(newMode);
      localStorage.setItem("theme", newMode);
  
      if (newMode === "on") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      playClickSound("checkButton");
    };






  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
    router.push("/landing-page");
  };

  const handleUpdateProfile = (newName, newAvatarUrl) => {
    setUser((u) => ({
      ...u,
      username: newName,
      avatarUrl: newAvatarUrl ?? u.avatarUrl,
    }));
    setCurrentUser((u) => ({
      ...u,
      username: newName,
      avatarUrl: newAvatarUrl ?? u.avatarUrl,
    }));
  };

  const handleDeleteAccount = () => {
    router.push("/landing-page");
  };

  if (loading) return (
    <div>
     <GameLoadingScreen
  loadingMessage={
    // <>
    //   Please <span className="text-[#5671f5]">Wait...</span>
    // </>
    changeLoadingMessage
  }
/>

    </div>

  );

  
  
    

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#141539] text-[#141539] dark:text-white md:p-10 p-10 relative">

      {/* Top left header */}
      <header className="flex items-center space-x-4 justify-between mb-6">
        {/* Welcome */}
        <div>
          <span className="inline md:text-2xl  font-bold">
            Welcome Back, {user.username.charAt(0).toUpperCase() + user.username.slice(1)}!
          </span>
        </div>
        

        {/* Avatar  */}
        <div className="flex items-center space-x-2">
          

          <div
  className="w-10 h-10 rounded-full overflow-hidden cursor-pointer flex items-center justify-center font-bold text-lg select-none bg-[#141539] dark:bg-white text-[#1f3756]"
  onClick={() =>{ setShowProfileMenu(true);
    playClickSound("menuButton")
  }}
>
  {user.avatarUrl ? (
    <Image
      src={user.avatarUrl}
      alt={user.username}
      width={40}
      height={40}
      className="object-cover w-full h-full"
    />
  ) : (
    user.username.charAt(0).toUpperCase()
  )}
</div>

        </div>
      </header>

      <Hand score={score} />

      <div className="grid place-items-center mt-20">
        <div className="relative w-[330px] h-[310.6px] md:w-[350px] md:h-[318.6px]">
  {/* Top row */}
  {choices.slice(0, 2).map((choice, index) => (
    <motion.div
      key={index}
      onClick={() => {
        router.push(
          `/result?player=${choice.name}&computer=${choices[Math.floor(Math.random() * 3)].name}&matchId=${crypto.randomUUID()}`
        );
        stopMusic();
        playClickSound("handButton");
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2 * index, duration: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`absolute top-0 ${index === 0 ? "left-0" : "right-0"} dark:bg-[#fafafa] bg-[#fafafa]  w-32 h-32 rounded-full border-[12px] flex justify-center items-center cursor-pointer ${choice.border}`}
    >
      <Image src={choice.image} alt={choice.name} className="w-[50px] h-[50px]" />
    </motion.div>
  ))}

  {/* Bottom row center */}
  <div className="absolute bottom-0 w-full flex justify-center">
    <motion.div
      key={choices[2].name}
      onClick={() => {
        router.push(
          `/result?player=${choices[2].name}&computer=${choices[Math.floor(Math.random() * 3)].name}&matchId=${crypto.randomUUID()}`
        );
        stopMusic();
        playClickSound("handButton");
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`dark:bg-[#fafafa] bg-gray-100 w-32 h-32 rounded-full border-[12px] flex justify-center items-center cursor-pointer ${choices[2].border}`}
    >
      <Image src={choices[2].image} alt={choices[2].name} className="w-[50px] h-[50px]" />
    </motion.div>
  </div>
</div>

      </div>

      <motion.button
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:left-auto md:right-4 border px-4 py-2 rounded-md text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        RULES
      </motion.button>

      {/* Profile Menu */}
      <AnimatePresence>
        {showProfileMenu && (
          <ProfileMenu
          darkMode={darkMode}
          handleToggleDarkMode={toggleDarkMode}
          user={user}
          rankDetails={currentUser}
          closeAction={() => setShowProfileMenu(false)}
          logoutAction={handleLogoutConfirm}
          updateProfileAction={handleUpdateProfile}
          deleteAccountAction={handleDeleteAccount}
          currentUser={currentUser}
            topPlayers={topPlayers}
            leaderboardLoading= {loading}
          />
          
        )}
      </AnimatePresence>
    </div>
  );
}
