import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot
} from "firebase/firestore";

import {
  auth,
  logoutUser
} from "../firebase/auth";

import { db } from "../firebase/firestore";

function ProtectedRoute({ children }) {
  const [loading, setLoading] =
    useState(true);

  const [allowed, setAllowed] =
    useState(false);

  useEffect(() => {
    let unsubscribeAuth = null;
    let unsubscribeUser = null;

    unsubscribeAuth = onAuthStateChanged(
      auth,
      (currentUser) => {

        // =========================
        // NOT LOGGED IN
        // =========================

        if (!currentUser) {
          setAllowed(false);
          setLoading(false);
          return;
        }

        // =========================
        // REAL-TIME USER STATUS
        // =========================

        const userRef = doc(
          db,
          "users",
          currentUser.uid
        );

        unsubscribeUser = onSnapshot(
          userRef,
          async (snapshot) => {

            // =========================
            // PROFILE NOT FOUND
            // =========================

            if (!snapshot.exists()) {
  setAllowed(false);
  setLoading(false);

  return;
}

            const userData =
              snapshot.data();

            // =========================
            // CHECK STATUS
            // =========================

            // Missing status = Active

            if (
              userData.status === "inactive"
            ) {
              await logoutUser();

              setAllowed(false);
              setLoading(false);

              return;
            }

            // =========================
            // ACTIVE USER
            // =========================

            setAllowed(true);
            setLoading(false);
          },

          async (error) => {
            console.error(
              "User status listener error:",
              error
            );

            await logoutUser();

            setAllowed(false);
            setLoading(false);
          }
        );
      }
    );

    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }

      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="empty-state">
        <p>
          Checking account access...
        </p>
      </div>
    );
  }

  // =========================
  // NOT ALLOWED
  // =========================

  if (!allowed) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // =========================
  // ALLOWED
  // =========================

  return children;
}

export default ProtectedRoute;