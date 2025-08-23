import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/lib/supabase-client";
import { Tables } from "@/db/types";
import { setAuthToken } from "@/lib/queryClient";

type UserSessionContextType = {
  userSession: any | null;
  setUserProfile: any;
  userProfile?: Tables<"user"> | undefined | null;
  loading: boolean;
  setUserSession: Function;
};

const UserSessionContext = createContext<UserSessionContextType | undefined>(
  undefined,
);

export const UserSessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userSession, setUserSession] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<Tables<"user"> | null>(null);

  const [loading, setLoading] = useState(true);

  const setUserProfileByEmail = async (email: string) => {
    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("email", email)
      .single();

    setUserProfile(data ?? null);
  };

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setAuthToken(session.access_token);
        setUserSession(session);
        await setUserProfileByEmail(session.user.email!);
      } else {
        setAuthToken(null);
        setUserProfile(null);
        setUserSession(null);
      }

      setLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserSession(session);
        setAuthToken(session?.access_token!);
        setUserProfileByEmail(session?.user?.email as string);
      } else {
        setAuthToken(null);
        setUserProfile(null);
        setUserSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserSessionContext.Provider
      value={{
        userSession,
        userProfile,
        setUserSession,
        loading,
        setUserProfile,
      }}
    >
      {children}
    </UserSessionContext.Provider>
  );
};

export const useUserSessionContext = () => {
  const context = useContext(UserSessionContext);
  if (!context)
    throw new Error(
      "useUserSessionContext must be used within a UserSessionProvider",
    );
  return context;
};
