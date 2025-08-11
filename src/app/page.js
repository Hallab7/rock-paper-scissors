"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import scissors from '../assets/images/icon-scissors.svg';
import paper from '../assets/images/icon-paper.svg';
import rock from '../assets/images/icon-rock.svg';
import Hand from '../components/hand';
import { motion, AnimatePresence } from "framer-motion";
import { MdLogout } from "react-icons/md";

import { getCurrentUser, logout } from "../utils/auth-client";
import ProfileMenu from "../components/ProfileMenu";

const choices = [
  { name: "rock", image: rock, border: "border-[#de3a5a]" },
  { name: "paper", image: paper, border: "border-[#5671f5]" },
  { name: "scissors", image: scissors, border: "border-[#eca922]" },
];

export default function Home() {
  const [score, setScore] = useState(10);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (!user) {
          router.push("/landing-page");
        } else {
          setUser(user);
          setScore(user.score ?? 10);
          setLoading(false);
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
  };

  const handleDeleteAccount = () => {
    router.push("/landing-page");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f3756] to-[#141539] text-white p-10 relative">

      {/* Top left header */}
      <header className="flex items-center space-x-4 justify-between mb-6">
        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center space-x-2 px-3 py-1 border border-white cursor-pointer rounded hover:bg-white hover:text-[#1f3756] transition"
          aria-label="Logout"
        >
          <MdLogout size={20} />
          <span className="hidden md:inline">Logout</span>
        </button>

        {/* Avatar and Welcome */}
        <div className="flex items-center space-x-2">
          <span className="hidden md:inline text-white font-semibold">
            Welcome, {user.username.charAt(0).toUpperCase() + user.username.slice(1)}!
          </span>

          <div
  className="w-10 h-10 rounded-full overflow-hidden cursor-pointer flex items-center justify-center font-bold text-lg select-none bg-white text-[#1f3756]"
  onClick={() => setShowProfileMenu(true)}
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

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white text-black p-6 rounded-xl text-center w-[300px]"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
              <p className="mb-6">Are you sure you want to logout?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Menu */}
      <AnimatePresence>
        {showProfileMenu && (
          <ProfileMenu
            user={user}
          closeAction={() => setShowProfileMenu(false)}
          logoutAction={handleLogoutConfirm}
          updateProfileAction={handleUpdateProfile}
          deleteAccountAction={handleDeleteAccount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
