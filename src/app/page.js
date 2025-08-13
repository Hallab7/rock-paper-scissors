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



export default function Home() {
  const [score, setScore] = useState(5);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const [changeLoadingMessage, setChangeLoadingMessage] = useState("");

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
          setScore(user.score ?? 5);
          
        }
      })
      .catch(() => {
        router.push("/landing-page");
      });
  }, [router]);

  useEffect(() => {
    if (!user) return;

    async function updateScoreBackend() {
      try {
        await fetch("/api/auth/score", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score }),
          credentials: "include",
        });
      } catch (err) {
        console.error("Failed to update score:", err);
      }
    }

    updateScoreBackend();
  }, [score, user]);



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
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);






  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
    router.push("/landing-page");
  };

  const handleUpdateProfile = (newName, newAvatarUrl) => {
    // setUser((u) => ({
    //   ...u,
    //   username: newName,
    //   avatarUrl: newAvatarUrl ?? u.avatarUrl,
    // }));
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
    <div className="min-h-screen bg-gradient-to-b from-[#1f3756] to-[#141539] text-white p-10 relative">

      {/* Top left header */}
      <header className="flex items-center space-x-4 justify-between mb-6">
        {/* Welcome */}
        <div>
          <span className="inline text-white font-semibold">
            Welcome Back, {currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1)}!
          </span>
        </div>
        

        {/* Avatar  */}
        <div className="flex items-center space-x-2">
          

          <div
  className="w-10 h-10 rounded-full overflow-hidden cursor-pointer flex items-center justify-center font-bold text-lg select-none bg-white text-[#1f3756]"
  onClick={() => setShowProfileMenu(true)}
>
  {user.avatarUrl ? (
    <Image
      src={currentUser.avatarUrl}
      alt={currentUser.username}
      width={40}
      height={40}
      className="object-cover w-full h-full"
    />
  ) : (
    currentUser.username.charAt(0).toUpperCase()
  )}
</div>

        </div>
      </header>

      <Hand score={score} />

      <div className="grid place-items-center mt-20">
        <div className="relative w-[350px] h-[318.6px]">
          {choices.map((choice, index) => {
            let positionClass = "";

            if (index === 0) {
              positionClass = "absolute top-0 left-0";
            } else if (index === 1) {
              positionClass = "absolute top-0 right-0";
            } else if (index === 2) {
              positionClass = "absolute bottom-0 left-1/2 transform -translate-x-1/2";
            }

            return (
              <motion.div
                key={index}
                onClick={() =>
                  router.push(
                    `/result?player=${choice.name}&computer=${
                      choices[Math.floor(Math.random() * 3)].name
                    }`
                  )
                }
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 * index, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-[#fafafa] w-32 h-32 rounded-full border-[12px] flex justify-center items-center cursor-pointer ${positionClass} ${choice.border}`}
              >
                <Image src={choice.image} alt={choice.name} className="w-[50px] h-[50px]" />
              </motion.div>
            );
          })}
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
