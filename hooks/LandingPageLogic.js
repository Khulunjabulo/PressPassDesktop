"use client";

//News-Reader and Print-Media Navbar Logic
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/Firebase/firebase";
import { useRouter } from "next/navigation";

export default function useLandingPageLogic() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleStartReading = () => {
    if (user) {
      router.push("/news-reader");
    } else {
      router.push("/signin");
    }
  };

  return { handleStartReading };
}
