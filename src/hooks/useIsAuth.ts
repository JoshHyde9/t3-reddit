import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useIsAuth = () => {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      void router.replace(`/login?next=${router.pathname}`);
    }
  }, [session, router]);
};
