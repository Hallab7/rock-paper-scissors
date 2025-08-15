"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Leaderboard from "./leaderboard";
import  ViewProfileDetails from "./ViewProfile"
import CheckBox from "./ui/checkBox"
import { playClickSound, stopMusic } from "../utils/playClickSound";

import {
  MdLogout,
  MdPerson,
  MdEdit,
  MdPeople,
  MdHistory,
  MdSettings,
  MdLeaderboard,
  MdArrowBack,
} from "react-icons/md";

/* ----------------------
   API helper functions
   ---------------------- */

async function updateProfileAPI(newName, newAvatarBase64) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "edit-profile",
      username: newName,
      avatarUrl: newAvatarBase64,
    }),
    credentials: "include",
  });
  if (!res.ok) {
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Failed to update profile");
    }
    throw new Error(data.error || "Failed to update profile");
  }
  return res.json();
}

async function deleteAccountAPI() {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "delete-account",
    }),
    credentials: "include",
  });
  if (!res.ok) {
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Failed to delete account");
    }
    throw new Error(data.error || "Failed to delete account");
  }
  return res.json();
}

async function changePasswordAPI(oldPassword, newPassword) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "change-password",
      oldPassword,
      newPassword,
    }),
    credentials: "include",
  });

  // try to parse response (backend returns JSON)
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Unexpected server response");
  }

  if (!res.ok) {
    throw new Error(data.error || "Failed to change password");
  }

  return data;
}

/* ----------------------
   Component
   ---------------------- */

export default function ProfileMenu({
  user,
  rankDetails,
  closeAction,
  logoutAction,
  updateProfileAction,
  deleteAccountAction,
  currentUser,
  topPlayers,
  leaderboardLoading
}) {
  // tabs + loading + errors
  const [activeTab, setActiveTab] = useState("view");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // For toggling password visibility
const [showCurrentPw, setShowCurrentPw] = useState(false);
const [showNewPw, setShowNewPw] = useState(false);
const [showConfirmPw, setShowConfirmPw] = useState(false);


  // settings state
  const [sound, setSound] = useState(true); // "on" | "off"
  const [notifications, setNotifications] = useState("on"); // "on" | "off"
  const [darkMode, setDarkMode] = useState("off"); // "on" | "off"

  // change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // edit profile fields
  const [editName, setEditName] = useState(user?.username || "");
  const [editAvatar, setEditAvatar] = useState(user?.avatarUrl || ""); // base64 preview or url

  // keep edit fields synced when user prop changes
  React.useEffect(() => {
    setEditName(user?.username || "");
    setEditAvatar(user?.avatarUrl || "");
  }, [user]);

   useEffect(() => {
    const storedValue = localStorage.getItem("soundEnabled");
    if (storedValue !== null) {
      setSound(storedValue !== "false");
    }
  }, []);

  
  const toggleSound = () => {
    const newValue = !sound;
    setSound(newValue);
    localStorage.setItem("soundEnabled", String(newValue));
  };

  /* ----------------------
     Handlers
     ---------------------- */

  const handleSaveProfile = async (name, avatarBase64) => {
    setLoading(true);
    setError("");
    try {
      const data = await updateProfileAPI(name, avatarBase64);
      updateProfileAction(data.user.username, data.user.avatarUrl);
      setActiveTab("view");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError("");
    try {
      await deleteAccountAPI();
      deleteAccountAction();
    } catch (err) {
      setError(err.message || "Failed to delete account");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeleteInput("");
    }
  };

  async function handleChangePassword() {
    setPwError("");
    setPwSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }

    setPwLoading(true);
    try {
      await changePasswordAPI(currentPassword, newPassword);
      setPwSuccess("Password updated successfully.");
      // clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // close after short delay
      setTimeout(() => {
        setPwSuccess("");
        setShowPasswordModal(false);
      }, 1000);
    } catch (err) {
      setPwError(err.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  }

  /* Avatar file -> base64 */
  const handleAvatarFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatar(reader.result); // base64 string
    };
    reader.readAsDataURL(file);
  };

  /* small helper to render radio */
  const Radio = ({ name, value, checked, onChange, label }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span>{label}</span>
    </label>
  );



  const PasswordToggleButton = ({ show, onClick, ariaLabel }) => (
  <button
    type="button"
    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
    onClick={onClick}
    aria-label={ariaLabel}
  >
    {show ? (
      // Eye-slash icon (hide)
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.027 10.027 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.998 9.998 0 011.025-2.072m2.417 2.417c.563-.442 1.258-.813 2.023-.813a4.025 4.025 0 014.025 4.025 4.025 4.025 0 01-.813 2.023m-4.023-4.023a4.025 4.025 0 00-4.025 4.025m4.025-4.025l2.417 2.417m-2.417-2.417l2.417 2.417"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ) : (
      // Eye icon (show)
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>
    )}
  </button>
);



  /* ----------------------
     Render
     ---------------------- */

  return (
    <AnimatePresence>
      {/* backdrop */}
      <motion.div
        className="fixed inset-0  z-40 h-screen bg-white "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        
      />

      {/* panel */}
      <motion.div
        className="fixed top-0 right-0 z-50 bg-white text-black   p-6 w-full max-h-[80vh] overflow-y-auto"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex mb-4 items-center">
          <div>
            <button onClick={ () => {
              closeAction();
              playClickSound("clickButton");
            }} 
            className="text-gray-500 hover:text-gray-700 cursor-pointer">
              <MdArrowBack size={24} />
            </button>
          </div>
          <div className="flex items-center justify-center mb-4 w-full">
            <h2 className="text-xl font-semibold ">Profile Menu</h2>
          </div>
        </div>

        <nav className="mb-4 flex flex-col space-y-2">
          {[
            { key: "view", label: "View Profile", icon: <MdPerson size={20} /> },
            { key: "edit", label: "Edit Profile", icon: <MdEdit size={20} /> },
            { key: "friends", label: "Friends / Invite Players", icon: <MdPeople size={20} /> },
            { key: "history", label: "Game History / Match Records", icon: <MdHistory size={20} /> },
            { key: "settings", label: "Settings", icon: <MdSettings size={20} /> },
            { key: "leaderboard", label: "Leaderboard", icon: <MdLeaderboard size={20} /> },
            { key: "logout", label: "Logout", icon: <MdLogout size={20} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() =>{setActiveTab(tab.key);
                playClickSound("clickButton")
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded cursor-pointer ${
                activeTab === tab.key ? "bg-blue-600 text-white" : "hover:bg-gray-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-300 pt-4  overflow-auto">
          {error && <p className="mb-2 text-red-600">{error}</p>}

          {activeTab === "view" && <ViewProfile userDetails={user}  />}

          {activeTab === "edit" && (
            <EditProfileTab
              username={editName}
              avatar={editAvatar}
              setName={setEditName}
              setAvatarFile={handleAvatarFile}
              onSave={() => handleSaveProfile(editName, editAvatar)}
              onDelete={() => setShowDeleteModal(true)}
              loading={loading}
            />
          )}

          {activeTab === "friends" && <FriendsTab friends={user.friends || []} />}

          {activeTab === "history" && <p>Game history and match records placeholder</p>}

          {activeTab === "settings" && (
  <div className="space-y-6">
    {/* Sound */}
    <CheckBox
  toolName={'Sound'}
  checked={sound === true}
  handleOnChange={() => {
    toggleSound();
    if (!sound) { // means it was off, now turning on
      playClickSound("checkButton");
      playClickSound("start"); 
    } else { // means it was on, now turning off
      stopMusic();
    }
  }}
/>



    {/* Notifications */}
    <CheckBox toolName={'Notifications'} checked={notifications === 'on'} handleOnChange={() => {

     setNotifications(notifications === 'on' ? 'off' : 'on');
      playClickSound("checkButton");
    }} />

    {/* Dark Mode */}
        <CheckBox
      toolName="Dark Mode"
      checked={darkMode === 'on'}
      handleOnChange={() => {
        setDarkMode(darkMode === 'on' ? 'off' : 'on');
        playClickSound("checkButton");
      }}
    />


    {/* Change Avatar */}

    {/* Change Password */}
    <div>
      <button
        onClick={() => {
          setPwError("");
          setPwSuccess("");
          setShowPasswordModal(true);
          playClickSound("clickButton");
        }}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Change Password
      </button>
    </div>
  </div>
)}

          {activeTab === "leaderboard" && 
          <Leaderboard
          topPlayers={topPlayers} 
          currentUser={currentUser} 
          loading={leaderboardLoading}
          />}

          {activeTab === "logout" && (
            <div className="text-center">
              <p>Are you sure you want to logout?</p>
              <span className="flex justify-center space-x-4">
                <button
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  onClick={() => {
                    logoutAction();
                    closeAction();
                    playClickSound("clickButton");
                  }}
                >
                  Confirm Logout
                </button>
                <button className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded" onClick={ () => {
                  closeAction();
                  playClickSound("clickButton");
                }}>
                  Cancel
                </button>
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4">Confirm Account Deletion</h2>
                <p className="mb-2 text-sm text-gray-700">
                  This action is permanent. Please type <strong>delete</strong> to confirm the deletion of your account.
                </p>
                <input
                  type="text"
                  className="w-full border text-black border-gray-300 rounded px-3 py-2 mb-4"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <button className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 cursor-pointer" onClick={() => { setShowDeleteModal(false);
                    playClickSound("clickButton");
                  }}>
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded text-white ${
                      deleteInput.toLowerCase() === "delete" ? "bg-red-600 hover:bg-red-700 cursor-pointer" : "bg-red-300 cursor-not-allowed"
                    }`}
                    disabled={deleteInput.toLowerCase() !== "delete" || loading}
                    onClick={ () => {
                      handleDeleteAccount();
                      playClickSound("clickButton");
                    }}>
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div
  className="bg-white p-6 rounded-lg shadow-lg w-96 text-black"
  onClick={(e) => e.stopPropagation()}
>
  <h2 className="text-lg font-bold mb-4">Change Password</h2>

  {pwError && <p className="text-sm text-red-600 mb-2">{pwError}</p>}
  {pwSuccess && <p className="text-sm text-green-600 mb-2">{pwSuccess}</p>}

  {/* Current Password */}
  <div className="relative mb-3">
    <input
      type={showCurrentPw ? "text" : "password"}
      placeholder="Current Password"
      className="w-full px-3 py-2 border rounded text-black"
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
      disabled={pwLoading}
    />
    <PasswordToggleButton
      show={showCurrentPw}
      onClick={() => setShowCurrentPw(!showCurrentPw)}
      ariaLabel="Toggle current password visibility"
    />
  </div>

  {/* New Password */}
  <div className="relative mb-3">
    <input
      type={showNewPw ? "text" : "password"}
      placeholder="New Password"
      className="w-full px-3 py-2 border rounded"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      disabled={pwLoading}
    />
    <PasswordToggleButton
      show={showNewPw}
      onClick={() => setShowNewPw(!showNewPw)}
      ariaLabel="Toggle new password visibility"
    />
  </div>

  {/* Confirm New Password */}
  <div className="relative mb-4">
    <input
      type={showConfirmPw ? "text" : "password"}
      placeholder="Confirm New Password"
      className="w-full px-3 py-2 border rounded"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      disabled={pwLoading}
    />
    <PasswordToggleButton
      show={showConfirmPw}
      onClick={() => setShowConfirmPw(!showConfirmPw)}
      ariaLabel="Toggle confirm password visibility"
    />
  </div>

  <div className="flex justify-end space-x-3">
    <button
      onClick={() => { 
        setShowPasswordModal(false);
        playClickSound("clickButton");
      }}
      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
    >
      Cancel
    </button>
    <button
      onClick={()=> {
        handleChangePassword();
        playClickSound("clickButton");
      }}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      disabled={pwLoading}
    >
      {pwLoading ? "Saving..." : "Save"}
    </button>
  </div>
</div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

/* ----------------------
   Subcomponents
   ---------------------- */

function ViewProfile({ userDetails }) {
  return (
    <div className="space-y-4">
      <ViewProfileDetails userDetails={userDetails} />
      
    </div>
  );
}

function EditProfileTab({ username, avatar, setName, setAvatarFile, onSave, onDelete, loading }) {
  // username and avatar come from parent controlled state
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold mb-1 block">Display Name</span>
        <input type="text" value={username} onChange={(e) => setName(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-black" disabled={loading} />
      </label>

      <label className="block">
        <span className="text-sm font-semibold mb-1 block">Avatar</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0])}
          className="w-full rounded border border-gray-300 px-3 py-2 text-black"
          disabled={loading}
        />
      </label>

      {avatar && (
        <div className="mt-2 w-20 h-20 rounded-full overflow-hidden">
          {/* if avatar is base64 or URL */}
          <img src={avatar} alt="Avatar preview" className="w-full h-full object-cover" />
        </div>
      )}

            <button
        onClick={() => {
          onSave();
          playClickSound("clickButton");
        }}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>


      <hr className="my-4" />

      <button 
      onClick={() => {
          onDelete();
          playClickSound("clickButton");
        }} 
      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded" disabled={loading}>
        Delete Account
      </button>
    </div>
  );
}

function FriendsTab({ friends }) {
  return (
  <div>
    <h3 className="font-semibold mb-2">Friends List</h3>
    {(!friends || friends.length === 0) ? (
      <p>You have no friends added yet.</p>
    ) : (
      <ul className="list-disc pl-5">
        {friends.map((friend, index) => (
          <li key={`friend-${index}-${friend}`}>{friend}</li>
        ))}
      </ul>
    )}
    <button
      className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
      onClick={() => {
        alert("Invite functionality to be implemented");
        playClickSound("clickButton");
      }}
    >
      Invite Friends to Play
    </button>
  </div>
);
}
