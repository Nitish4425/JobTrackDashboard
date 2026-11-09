import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import {
  auth,
  logoutUser
} from "../firebase/auth";

import { db } from "../firebase/firestore";

function AdminRoute({ children }) {
  const [loading, setLoading] =
    useState(true);

  const [allowed, setAllowed] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {

        // =========================
        // NOT LOGGED IN
        // =========================

        if (!user) {
          if (isMounted) {
            setAllowed(false);
            setLoading(false);
          }

          return;
        }

        try {
          // =========================
          // GET USER PROFILE
          // =========================

          const userRef = doc(
            db,
            "users",
            user.uid
          );

          const userSnapshot =
            await getDoc(userRef);

          // =========================
          // PROFILE NOT FOUND
          // =========================

          if (!userSnapshot.exists()) {
            await logoutUser();

            if (isMounted) {
              setAllowed(false);
              setLoading(false);
            }

            return;
          }

          const userData =
            userSnapshot.data();

          // =========================
          // CHECK ACCOUNT STATUS
          // =========================

          // Missing status = Active

          if (
            userData.status === "inactive"
          ) {
            await logoutUser();

            if (isMounted) {
              setAllowed(false);
              setLoading(false);
            }

            return;
          }

          // =========================
          // CHECK ADMIN ROLE
          // =========================

          if (
            userData.role !== "admin"
          ) {
            if (isMounted) {
              setAllowed(false);
              setLoading(false);
            }

            return;
          }

          // =========================
          // ADMIN IS ACTIVE
          // =========================

          if (isMounted) {
            setAllowed(true);
            setLoading(false);
          }

        } catch (error) {
          console.error(
            "Admin authorization error:",
            error
          );

          await logoutUser();

          if (isMounted) {
            setAllowed(false);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          color: "#4b5563"
        }}
      >
        Checking account access...
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
  // ADMIN ALLOWED
  // =========================

  return children;
}

export default AdminRoute;