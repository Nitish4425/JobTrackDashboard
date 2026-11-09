import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser
} from "firebase/auth";

import app from "./firebase";

const auth = getAuth(app);

// =========================
// REGISTER
// =========================

export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
};

// =========================
// LOGIN
// =========================

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(
    auth,
    email,
    password
  );
};

// =========================
// LOGOUT
// =========================

export const logoutUser = () => {
  return signOut(auth);
};

// =========================
// FORGOT PASSWORD
// =========================

export const resetPassword = (email) => {
  return sendPasswordResetEmail(
    auth,
    email
  );
};

// =========================
// CHANGE PASSWORD
// =========================

export const changePassword = async (
  currentPassword,
  newPassword
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in."
    );
  }

  if (!user.email) {
    throw new Error(
      "No email is associated with this account."
    );
  }

  // Re-authenticate using current password
  const credential =
    EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

  await reauthenticateWithCredential(
    user,
    credential
  );

  // Update password
  await updatePassword(
    user,
    newPassword
  );
};

// =========================
// DELETE CURRENT USER
// =========================

export const deleteCurrentUser = async (
  currentPassword,
  deleteAccount = true
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in."
    );
  }

  if (!user.email) {
    throw new Error(
      "No email is associated with this account."
    );
  }

  // Re-authenticate using current password
  const credential =
    EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

  await reauthenticateWithCredential(
    user,
    credential
  );

  // Delete Firebase Authentication account
  // only when deleteAccount is true
  if (deleteAccount) {
    await deleteUser(user);
  }
};

// =========================
// EXPORT AUTH
// =========================

export { auth };