import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  serverTimestamp,
  writeBatch,
  onSnapshot
} from "firebase/firestore";

import app from "./firebase";
import { auth } from "./auth";

const db = getFirestore(app);

// =========================
// USER PROFILE
// =========================

// Create user profile
export const createUserProfile = async (
  uid,
  profileData
) => {
  const userRef = doc(
    db,
    "users",
    uid
  );

  await setDoc(userRef, {
    ...profileData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Get user profile
export const getUserProfile = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  const userRef = doc(
    db,
    "users",
    user.uid
  );

  const snapshot = await getDoc(
    userRef
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
};

// Get all users - Admin only
export const getAllUsers = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  const usersRef = collection(
    db,
    "users"
  );

  const snapshot = await getDocs(
    usersRef
  );

  return snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data()
    })
  );
};

// =====================================================
// ADMIN - REAL-TIME ALL USERS
// =====================================================

export const subscribeToAllUsers = (
  onUsersChange,
  onError
) => {
  const usersRef = collection(db, "users");

  return onSnapshot(
    usersRef,
    (snapshot) => {
      const users = snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data()
        })
      );

      onUsersChange(users);
    },
    (error) => {
      console.error(
        "Real-time users listener error:",
        error
      );

      if (typeof onError === "function") {
        onError(error);
      }
    }
  );
};

// Update user profile
export const updateUserProfile = async (
  profileData
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  const userRef = doc(
    db,
    "users",
    user.uid
  );

  await setDoc(
    userRef,
    {
      ...profileData,
      email: user.email,
      updatedAt: serverTimestamp()
    },
    {
      merge: true
    }
  );
};

// =========================
// APPLICATIONS
// =========================

// Add new application
export const addApplication = async (
  applicationData
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  return await addDoc(
    collection(
      db,
      "applications"
    ),
    {
      ...applicationData,
      userId: user.uid,
      createdAt: new Date()
    }
  );
};

// Get user's applications
export const getApplications = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  const q = query(
    collection(
      db,
      "applications"
    ),
    where(
      "userId",
      "==",
      user.uid
    )
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data()
    })
  );
};

// Delete application
export const deleteApplication = async (
  id
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  await deleteDoc(
    doc(
      db,
      "applications",
      id
    )
  );
};

// Update application
export const updateApplication = async (
  id,
  applicationData
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  const applicationRef = doc(
    db,
    "applications",
    id
  );

  await updateDoc(
    applicationRef,
    {
      ...applicationData
    }
  );
};

// =========================
// INTERVIEWS
// =========================

// Add interview
export const addInterview = async (
  interviewData
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  return await addDoc(
    collection(
      db,
      "interviews"
    ),
    {
      ...interviewData,
      userId: user.uid,
      createdAt: new Date()
    }
  );
};

// Get user's interviews
export const getInterviews = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  const q = query(
    collection(
      db,
      "interviews"
    ),
    where(
      "userId",
      "==",
      user.uid
    )
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data()
    })
  );
};

// Update interview
export const updateInterview = async (
  id,
  interviewData
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  const interviewRef = doc(
    db,
    "interviews",
    id
  );

  await updateDoc(
    interviewRef,
    {
      ...interviewData
    }
  );
};

// Delete interview
export const deleteInterview = async (
  id
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  await deleteDoc(
    doc(
      db,
      "interviews",
      id
    )
  );
};

// =========================
// SAVED JOBS
// =========================

// Add saved job
export const addSavedJob = async (
  jobData
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  return await addDoc(
    collection(
      db,
      "savedJobs"
    ),
    {
      ...jobData,
      userId: user.uid,
      createdAt: new Date()
    }
  );
};

// Get saved jobs
export const getSavedJobs = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  const q = query(
    collection(
      db,
      "savedJobs"
    ),
    where(
      "userId",
      "==",
      user.uid
    )
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data()
    })
  );
};

// Update saved job
export const updateSavedJob = async (
  id,
  jobData
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  const jobRef = doc(
    db,
    "savedJobs",
    id
  );

  await updateDoc(
    jobRef,
    {
      ...jobData,
      userId: user.uid,
      updatedAt: serverTimestamp()
    }
  );
};

// =====================================================
// ADMIN - UPDATE SAVED JOB
// =====================================================

export const updateAdminSavedJob = async (
  jobId,
  jobData
) => {
  if (!jobId) {
    throw new Error(
      "Saved job ID is required."
    );
  }

  const jobRef = doc(
    db,
    "savedJobs",
    jobId
  );

  await updateDoc(
    jobRef,
    {
      ...jobData,
      updatedAt: serverTimestamp()
    }
  );
};

// Delete saved job
export const deleteSavedJob = async (
  id
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  await deleteDoc(
    doc(
      db,
      "savedJobs",
      id
    )
  );
};

// =========================
// ADMIN - ADD APPLICATION
// =========================

export const addAdminApplication = async (
  userId,
  applicationData
) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  return await addDoc(
    collection(
      db,
      "applications"
    ),
    {
      ...applicationData,
      userId: userId,
      createdAt: new Date()
    }
  );
};

// =========================
// ADMIN - ADD INTERVIEW
// =========================

export const addAdminInterview = async (
  userId,
  interviewData
) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  return await addDoc(
    collection(
      db,
      "interviews"
    ),
    {
      ...interviewData,
      userId: userId,
      createdAt: new Date()
    }
  );
};

// =========================
// ADMIN - ADD SAVED JOB
// =========================

export const addAdminSavedJob = async (
  userId,
  jobData
) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  return await addDoc(
    collection(
      db,
      "savedJobs"
    ),
    {
      ...jobData,
      userId: userId,
      createdAt: new Date()
    }
  );
};

// =========================
// DELETE ALL USER DATA
// =========================

export const deleteUserData = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in"
    );
  }

  const batch = writeBatch(db);

  // -------------------------
  // Delete user profile
  // -------------------------

  const userRef = doc(
    db,
    "users",
    user.uid
  );

  batch.delete(userRef);

  // -------------------------
  // Delete applications
  // -------------------------

  const applicationsQuery = query(
    collection(
      db,
      "applications"
    ),
    where(
      "userId",
      "==",
      user.uid
    )
  );

  const applicationsSnapshot =
    await getDocs(
      applicationsQuery
    );

  applicationsSnapshot.forEach(
    (document) => {
      batch.delete(
        document.ref
      );
    }
  );

  // -------------------------
  // Delete interviews
  // -------------------------

  const interviewsQuery = query(
    collection(
      db,
      "interviews"
    ),
    where(
      "userId",
      "==",
      user.uid
    )
  );

  const interviewsSnapshot =
    await getDocs(
      interviewsQuery
    );

  interviewsSnapshot.forEach(
    (document) => {
      batch.delete(
        document.ref
      );
    }
  );

  // -------------------------
  // Delete saved jobs
  // -------------------------

  const savedJobsQuery = query(
    collection(
      db,
      "savedJobs"
    ),
    where(
      "userId",
      "==",
      user.uid
    )
  );

  const savedJobsSnapshot =
    await getDocs(
      savedJobsQuery
    );

  savedJobsSnapshot.forEach(
    (document) => {
      batch.delete(
        document.ref
      );
    }
  );

  // -------------------------
  // Commit all deletions
  // -------------------------

  await batch.commit();
};

// =========================
// EXPORT DATABASE
// =========================

export { db };

// =====================================================
// ADMIN - GET COMPLETE USER DATA
// =====================================================

export const getAdminUserData = async (
  userId
) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  // USER PROFILE

  const userRef = doc(
    db,
    "users",
    userId
  );

  const userSnapshot = await getDoc(
    userRef
  );

  if (!userSnapshot.exists()) {
    throw new Error(
      "User not found."
    );
  }

  const user = {
    id: userSnapshot.id,
    ...userSnapshot.data()
  };

  // APPLICATIONS

  const applicationsQuery = query(
    collection(
      db,
      "applications"
    ),
    where(
      "userId",
      "==",
      userId
    )
  );

  const applicationsSnapshot =
    await getDocs(
      applicationsQuery
    );

  const applications =
    applicationsSnapshot.docs.map(
      (document) => ({
        id: document.id,
        ...document.data()
      })
    );

  // INTERVIEWS

  const interviewsQuery = query(
    collection(
      db,
      "interviews"
    ),
    where(
      "userId",
      "==",
      userId
    )
  );

  const interviewsSnapshot =
    await getDocs(
      interviewsQuery
    );

  const interviews =
    interviewsSnapshot.docs.map(
      (document) => ({
        id: document.id,
        ...document.data()
      })
    );

  // SAVED JOBS

  const savedJobsQuery = query(
    collection(
      db,
      "savedJobs"
    ),
    where(
      "userId",
      "==",
      userId
    )
  );

  const savedJobsSnapshot =
    await getDocs(
      savedJobsQuery
    );

  const savedJobs =
    savedJobsSnapshot.docs.map(
      (document) => ({
        id: document.id,
        ...document.data()
      })
    );

  return {
    user,
    applications,
    interviews,
    savedJobs
  };
};

// =====================================================
// ADMIN - UPDATE USER PROFILE
// =====================================================

export const updateAdminUserProfile = async (
  userId,
  profileData
) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  await setDoc(
    userRef,
    {
      name: profileData.name || "",
      currentRole:
        profileData.currentRole || "",
      location:
        profileData.location || "",
      bio: profileData.bio || ""
    },
    {
      merge: true
    }
  );
};

// =====================================================
// ADMIN - UPDATE USER STATUS
// =====================================================

export const updateUserStatus = async (
  userId,
  status
) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  if (
    !["active", "inactive"].includes(
      status
    )
  ) {
    throw new Error(
      "Invalid user status."
    );
  }

  const userRef = doc(
    db,
    "users",
    userId
  );

  await updateDoc(
    userRef,
    {
      status: status,
      updatedAt: serverTimestamp()
    }
  );
};