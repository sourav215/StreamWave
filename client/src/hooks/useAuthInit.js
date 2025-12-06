import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { restoreAuth, setAuthLoading } from "@/store/slices/authSlice";

export const useAuthInit = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Restore auth from localStorage on app mount
    const initializeAuth = () => {
      if (typeof window !== "undefined") {
        const storedAuth = localStorage.getItem("authCredentials");
        if (storedAuth) {
          try {
            const { user, accessToken } = JSON.parse(storedAuth);
            dispatch(restoreAuth({ user, accessToken }));
          } catch (error) {
            console.error("Failed to restore auth:", error);
            dispatch(setAuthLoading(false));
          }
        } else {
          dispatch(setAuthLoading(false));
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  return { isLoading };
};
