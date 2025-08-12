"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Leaderboard from "./leaderboard";

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
  closeAction,
  logoutAction,
  updateProfileAction,
  deleteAccountAction,
}) {
  // tabs + loading + errors
  const [activeTab, setActiveTab] = useState("view");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // settings state
  const [sound, setSound] = useState("on"); // "on" | "off"
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
            <button onClick={closeAction} className="text-gray-500 hover:text-gray-700 cursor-pointer">
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
              onClick={() => setActiveTab(tab.key)}
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

          {activeTab === "view" && <ViewProfile user={user} />}

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
              <div>
                <label className="block font-semibold mb-1">Sound</label>
                <div className="flex space-x-4">
                  <Radio name="sound" value="on" checked={sound === "on"} onChange={setSound} label="On" />
                  <Radio name="sound" value="off" checked={sound === "off"} onChange={setSound} label="Off" />
                </div>
              </div>

              {/* Notifications */}
              <div>
                <label className="block font-semibold mb-1">Notifications</label>
                <div className="flex space-x-4">
                  <Radio name="notifications" value="on" checked={notifications === "on"} onChange={setNotifications} label="On" />
                  <Radio name="notifications" value="off" checked={notifications === "off"} onChange={setNotifications} label="Off" />
                </div>
              </div>

              {/* Dark Mode */}
              <div>
                <label className="block font-semibold mb-1">Dark Mode</label>
                <div className="flex space-x-4">
                  <Radio name="darkmode" value="on" checked={darkMode === "on"} onChange={setDarkMode} label="On" />
                  <Radio name="darkmode" value="off" checked={darkMode === "off"} onChange={setDarkMode} label="Off" />
                </div>
              </div>

              {/* Change Password */}
              <div>
                <button
                  onClick={() => {
                    setPwError("");
                    setPwSuccess("");
                    setShowPasswordModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Change Password
                </button>
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && 
          <Leaderboard />}

          {activeTab === "logout" && (
            <div className="text-center">
              <p>Are you sure you want to logout?</p>
              <span className="flex justify-center space-x-4">
                <button
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  onClick={() => {
                    logoutAction();
                    closeAction();
                  }}
                >
                  Confirm Logout
                </button>
                <button className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded" onClick={closeAction}>
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
                  <button className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 cursor-pointer" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded text-white ${
                      deleteInput.toLowerCase() === "delete" ? "bg-red-600 hover:bg-red-700 cursor-pointer" : "bg-red-300 cursor-not-allowed"
                    }`}
                    disabled={deleteInput.toLowerCase() !== "delete" || loading}
                    onClick={handleDeleteAccount}
                  >
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
              <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-black " onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4">Change Password</h2>

                {pwError && <p className="text-sm text-red-600 mb-2">{pwError}</p>}
                {pwSuccess && <p className="text-sm text-green-600 mb-2">{pwSuccess}</p>}

                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full mb-3 px-3 py-2 border rounded text-black"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={pwLoading}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full mb-3 px-3 py-2 border rounded"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={pwLoading}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full mb-4 px-3 py-2 border rounded"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={pwLoading}
                />

                <div className="flex justify-end space-x-3">
                  <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                  <button onClick={handleChangePassword} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={pwLoading}>
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

function ViewProfile({ user }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {user?.avatarUrl ? (
          <div className="w-20 h-20 rounded-full overflow-hidden relative">
            <Image src={user.avatarUrl} alt={user.username} fill style={{ objectFit: "cover" }} sizes="80px" className="block" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold text-gray-700">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold">{user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Unknown"}</h2>
          <p>
            Rank: <strong>{user?.rank || "N/A"}</strong> | Level: <strong>{user?.level || "N/A"}</strong>
          </p>
          <p>
            Wins: <strong>{user?.wins || 0}</strong> | Losses: <strong>{user?.losses || 0}</strong>
          </p>
          <p>Total Games Played: <strong>{user?.totalGames || 0}</strong></p>
        </div>
      </div>
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

      <button onClick={onSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </button>

      <hr className="my-4" />

      <button onClick={onDelete} className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded" disabled={loading}>
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
          {friends.map((friend) => (
            <li key={friend}>{friend}</li>
          ))}
        </ul>
      )}
      <button className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded" onClick={() => alert("Invite functionality to be implemented")}>
        Invite Friends to Play
      </button>
    </div>
  );
}
