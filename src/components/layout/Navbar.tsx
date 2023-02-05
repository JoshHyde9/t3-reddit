import { type Session } from "next-auth";
import React, { type ChangeEvent, useState, useEffect, useRef } from "react";
import Link from "next/link";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

import { api } from "../../utils/api";

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
                await signOut({ redirect: true, callbackUrl: "/all" })
              }
            >
              Logout
            </button>
            <NavLink
              to={`/user/${session.user.username}`}
              onClick={() => setOpen(!open)}
            >
              {session.user.username}
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

function useOutsideAlerter(
  ref: React.RefObject<HTMLInputElement>,
  setDropDown: React.Dispatch<React.SetStateAction<boolean>>
) {
  useEffect(() => {
    // Close dropdown if clicked outside
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setDropDown(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, setDropDown]);
}

const NavBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [dropDown, setDropDown] = useState(false);

  const wrapperRef = useRef<HTMLInputElement>(null);
  useOutsideAlerter(wrapperRef, setDropDown);

  const { mutate: search, data } = api.search.searchAll.useMutation();

  const handleSearchTerm = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    search({ searchTerm });
    setDropDown(true);
  };

  return (
    <nav className="flex h-20 w-screen items-center px-4 py-4">
      <MobileNav open={open} setOpen={setOpen} session={session} />

      <div className="flex w-full items-center md:pr-10">
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

        <div className="mt-10 hidden grow items-center md:flex">
          <div className="relative flex">
            <form className="w-full" onSubmit={handleSearch}>
              <input
                value={searchTerm}
                onChange={handleSearchTerm}
                type="text"
                className="w-full rounded-md border-2 border-teal-600 py-1 px-2 focus:outline-none"
                placeholder="Search Reddit"
                onClick={() => setDropDown(true)}
              />
            </form>
            {dropDown ? (
              <div
                className="absolute z-10 w-full translate-y-8 rounded-md rounded-t-none border-2 border-teal-600 bg-white px-2 pt-4"
                ref={wrapperRef}
              >
                {data && (
                  <>
                    <h1 className="font-semibold">Communities</h1>
                    <hr className="my-2" />
                    <div onClick={() => setDropDown(false)}>
                      {data.subs.map((sub, i) => (
                        <div key={i} className="cursor-pointer p-1">
                          <Link href={`/r/${sub.name}`}>r/{sub.name}</Link>
                        </div>
                      ))}
                    </div>
                    <h1 className="font-semibold">People</h1>
                    <hr className="my-2" />
                    <div onClick={() => setDropDown(false)}>
                      {data.users.map((user, i) => (
                        <div key={i}>
                          <div key={i} className="cursor-pointer p-1">
                            <Link href={`/user/${user.username}`}>
                              u/{user.username}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 ml-auto hidden items-center md:flex">
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
                  await signOut({ redirect: true, callbackUrl: "/all" });
                }}
                className="relative px-4 transition duration-300 ease-in-out hover:text-teal-500"
              >
                Logout
              </button>
              <NavLink to={`/user/${session.user.username}`}>
                {session.user.username}
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
