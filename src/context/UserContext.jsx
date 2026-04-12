import { startTransition, useEffect, useState } from "react";
import supabase from "../database/supabase";
import { UserContext } from "./user-context";

async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Profile fetch error:", error.message);
    return null;
  }

  return data ?? null;
}

async function getSessionSnapshot(session) {
  const nextUser = session?.user ?? null;
  const nextProfile = nextUser ? await getProfile(nextUser.id) : null;

  return { nextUser, nextProfile };
}

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isActive = true;

    const syncAuthState = async (session) => {
      const { nextUser, nextProfile } = await getSessionSnapshot(session);

      if (!isActive) {
        return;
      }

      startTransition(() => {
        setUser(nextUser);
        setProfile(nextProfile);
      });
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void syncAuthState(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncAuthState(session);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const signUp = async (newUser) => {
    const { data, error } = await supabase.auth.signUp(newUser);
    if (error) {
      console.error("SignUp error:", error.message);
      return { error };
    }
    if (data?.user) {
      setUser(data.user);
    }
    if (data?.session) {
      const nextProfile = await getProfile(data.user.id);
      setProfile(nextProfile);
    }
    return { data };
  };

  const login = async (loggedUser) => {
    const { data, error } = await supabase.auth.signInWithPassword(loggedUser);
    if (error) {
      console.error("Login error:", error.message);
      return { error };
    }
    if (data?.user) {
      setUser(data.user);
    }
    if (data?.session) {
      const nextProfile = await getProfile(data.user.id);
      setProfile(nextProfile);
    }
    return { data };
  };

  return (
    <UserContext.Provider value={{ user, profile, signOut, signUp, login }}>
      {children}
    </UserContext.Provider>
  );
}