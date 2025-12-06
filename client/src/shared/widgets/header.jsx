"use client";
import Link from "next/link";
import React from "react";
import { CgProfile } from "react-icons/cg";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { Button } from "antd";

const Header = () => {
  const user = useSelector((state) => state.auth?.user);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <div className="w-full bg-white shadow-sm">
      <div className="w-[90%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href="/">
            <span className="text-2xl font-semibold text-red-400">
              Stream Wave
            </span>
          </Link>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/chat">
            <span className="text-lg font-medium hover:text-red-400 transition">
              Chat
            </span>
          </Link>
          <Link href="/about">
            <span className="text-lg font-medium hover:text-red-400 transition">
              About
            </span>
          </Link>
          {isAuthenticated && user ? (
            <>
              <div className="flex gap-2 items-center">
                <div>
                  <CgProfile size={40} strokeWidth={0.1} />
                </div>
                <div className="min-w-[100px] flex flex-col">
                  <p className="text-sm text-gray-600">Hello,</p>
                  <span className="font-semibold">{user.name}</span>
                </div>
              </div>
              <Button danger onClick={handleLogout} className="ml-4">
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button type="primary">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
