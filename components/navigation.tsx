"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export const Navigation = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          YouTube Collections
        </Link>
        <div className="hidden md:flex space-x-4">
          <Link
            href="/"
            className={`text-white hover:text-gray-300 ${
              pathname === "/" ? "font-bold" : ""
            }`}
          >
            Home
          </Link>
          {session ? (
            <button
              onClick={() => signOut()}
              className="text-white hover:text-gray-300"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="text-white hover:text-gray-300"
            >
              Sign In
            </button>
          )}
        </div>
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
          >
            <svg
              className="h-6 w-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <Link
            href="/"
            className={`block text-white hover:text-gray-300 py-2 ${
              pathname === "/" ? "font-bold" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          {session ? (
            <button
              onClick={() => {
                signOut();
                setIsMenuOpen(false);
              }}
              className="block text-white hover:text-gray-300 py-2 w-full text-left"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => {
                signIn("google");
                setIsMenuOpen(false);
              }}
              className="block text-white hover:text-gray-300 py-2 w-full text-left"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
