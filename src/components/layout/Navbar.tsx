import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { type Session } from "next-auth";

const NavLink = ({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) => {
  const router = useRouter();

  return (
    <NextLink
      href={to}
      onClick={onClick}
      className={`relative my-2 px-4 transition duration-300 ease-in-out md:my-0 ${
        router.asPath === to ? "text-teal-600" : "stroke  hover:text-teal-500"
      }`}
    >
      {children}
    </NextLink>
  );
};

const MobileNav = ({
  open,
  setOpen,
  session,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  session: Session | null;
}) => {
  return (
    <div
      className={`absolute top-0 left-0 z-10 h-screen w-screen transform bg-white ${
        open ? "-translate-x-0" : "-translate-x-full"
      } drop-shadow-md filter transition-transform duration-300 ease-in-out `}
    >
      <div className="mt-9 ml-4 flex flex-col justify-start text-xl">
        <NavLink to="/" onClick={() => setOpen(!open)}>
          Home
        </NavLink>
        <NavLink to="/all" onClick={() => setOpen(!open)}>
          Home
        </NavLink>
        {!session && (
          <>
            <NavLink to="/login" onClick={() => setOpen(!open)}>
              Login
            </NavLink>
            <NavLink to="/register" onClick={() => setOpen(!open)}>
              Register
            </NavLink>
          </>
        )}
        {session && (
          <>
            <NavLink to="/post/create" onClick={() => setOpen(!open)}>
              Create
            </NavLink>
            <button
              className="my-2 px-4 text-left font-normal md:my-0"
              onClick={async () =>
                await signOut({ redirect: true, callbackUrl: "/" })
              }
            >
              Logout
            </button>
            <NavLink to="/account" onClick={() => setOpen(!open)}>
              {session.user.username}
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

const NavBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  return (
    <nav className="flex h-20 w-screen items-center px-4 py-4">
      <MobileNav open={open} setOpen={setOpen} session={session} />
      <div className="flex w-full items-center justify-end md:pr-10">
        <div
          className="relative z-50 flex h-8 w-8 flex-col items-center justify-between md:hidden"
          onClick={() => {
            setOpen(!open);
          }}
        >
          {/* hamburger button */}
          <span
            className={`h-1 w-full transform rounded-lg bg-slate-300 transition duration-300 ease-in-out ${
              open ? "translate-y-3.5 rotate-45" : ""
            }`}
          />
          <span
            className={`h-1 w-full rounded-lg bg-slate-300 transition-all duration-300 ease-in-out ${
              open ? "w-0" : "w-full"
            }`}
          />
          <span
            className={`h-1 w-full transform rounded-lg bg-slate-300 transition duration-300 ease-in-out ${
              open ? "-translate-y-3.5 -rotate-45" : ""
            }`}
          />
        </div>

        <div className="mt-10 hidden items-center md:flex">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/all">All</NavLink>
          {!session && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
          {session && (
            <>
              <NavLink to="/post/create">Create</NavLink>
              <button
                onClick={async () => {
                  await signOut({ redirect: true, callbackUrl: "/" });
                }}
                className="relative px-4 transition duration-300 ease-in-out hover:text-teal-500"
              >
                Logout
              </button>
              <NavLink to="/account">{session.user.username}</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
