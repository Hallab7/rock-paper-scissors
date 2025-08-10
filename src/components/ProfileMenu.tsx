"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdLogout,
  MdPerson,
  MdEdit,
  MdPeople,
  MdHistory,
  MdSettings,
  MdLeaderboard,
  MdClose
} from "react-icons/md";

async function updateProfileAPI(newName, newAvatarUrl) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "edit-profile",
      username: newName,
      avatarUrl: newAvatarUrl,
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

export default function ProfileMenu({
  user,
  closeAction,
  logoutAction,
  updateProfileAction,
  deleteAccountAction,
}) {
  const [activeTab, setActiveTab] = useState("view");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const handleSaveProfile = async (name, avatar) => {
    setLoading(true);
    setError("");
    try {
      const data = await updateProfileAPI(name, avatar);
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
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-opacity-40 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAction}
      />

      <motion.div
        className="fixed top-16 right-4 z-50 bg-white text-black rounded-lg shadow-lg p-6 w-80 max-h-[80vh] overflow-y-auto"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Profile Menu</h2>
          <button onClick={closeAction} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <MdClose size={24} />
          </button>
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

        <div className="border-t border-gray-300 pt-4 max-h-[60vh] overflow-auto">
          {error && <p className="mb-2 text-red-600">{error}</p>}

          {activeTab === "view" && <ViewProfile user={user} />}

          {activeTab === "edit" && (
            <EditProfileTab
              username={user.username}
              avatarUrl={user.avatarUrl}
              onSave={handleSaveProfile}
              onDelete={() => setShowDeleteModal(true)}
              loading={loading}
            />
          )}

          {activeTab === "friends" && <FriendsTab friends={user.friends || []} />}

          {activeTab === "history" && <p>Game history and match records placeholder</p>}

          {activeTab === "settings" && (
            <p>Settings placeholder (sound, notifications, language, themes)</p>
          )}

          {activeTab === "leaderboard" && <p>Leaderboard placeholder (top players and ranks)</p>}

          {activeTab === "logout" && (
            <div className="text-center">
              <p>Are you sure you want to logout?</p>
              <span className="flex justify-between space-x-2">
                <button
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  onClick={() => {
                    logoutAction();
                    closeAction();
                  }}
                >
                  Confirm Logout
                </button>
                <button
                  className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                  onClick={closeAction}
                >
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
              <div
                className="bg-white p-6 rounded-lg shadow-lg w-96"
                onClick={(e) => e.stopPropagation()}
              >
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
                  <button
                    className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 cursor-pointer"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded text-white ${
                      deleteInput.toLowerCase() === "delete"
                        ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                        : "bg-red-300 cursor-not-allowed"
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
    </AnimatePresence>
  );
}

function ViewProfile({ user }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {user.avatarUrl ? (
          <div className="w-20 h-20 rounded-full overflow-hidden relative">
  <Image
    src={user.avatarUrl}
    alt={user.username}
    fill
    style={{ objectFit: "cover" }}
    sizes="80px"
    className="block"
    // If you store avatars as data URLs, add unoptimized to avoid Next optimization issues:
    // unoptimized
  />
</div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold text-gray-700">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold">
            {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
          </h2>
          <p>
            Rank: <strong>{user.rank || "N/A"}</strong> | Level:{" "}
            <strong>{user.level || "N/A"}</strong>
          </p>
          <p>
            Wins: <strong>{user.wins || 0}</strong> | Losses:{" "}
            <strong>{user.losses || 0}</strong>
          </p>
          <p>
            Total Games Played: <strong>{user.totalGames || 0}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

function EditProfileTab({ username, avatarUrl, onSave, onDelete, loading }) {
  const [name, setName] = useState(username);
  const [avatar, setAvatar] = useState(avatarUrl || "");

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold mb-1 block">Display Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-black"
          disabled={loading}
        />
      </label>

      <label className="block">
  <span className="text-sm font-semibold mb-1 block">Avatar</span>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result as string); // Base64 preview
        };
        reader.readAsDataURL(file);
      }
    }}
    className="w-full rounded border border-gray-300 px-3 py-2 text-black"
    disabled={loading}
  />
</label>

{avatar && (
  <div className="mt-2 w-20 h-20 rounded-full overflow-hidden">
    <img
      src={avatar}
      alt="Avatar preview"
      className="w-full h-full object-cover"
    />
  </div>
)}



      <button
        onClick={() => onSave(name, avatar)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

      <hr className="my-4" />

      <button
        onClick={onDelete}
        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded"
        disabled={loading}
      >
        Delete Account
      </button>
    </div>
  );
}

function FriendsTab({ friends }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Friends List</h3>
      {friends.length === 0 ? (
        <p>You have no friends added yet.</p>
      ) : (
        <ul className="list-disc pl-5">
          {friends.map((friend) => (
            <li key={friend}>{friend}</li>
          ))}
        </ul>
      )}
      <button
        className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        onClick={() => alert("Invite functionality to be implemented")}
      >
        Invite Friends to Play
      </button>
    </div>
  );
}
