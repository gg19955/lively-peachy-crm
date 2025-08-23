import React from "react";
import logoImage from "@assets/CAPITAL ICONS (13)_1754548082359.png";
import { Link } from "react-router-dom";

interface HeaderProps {
  title?: string;
}

export default function TopAppBar({
  title = "Lively Properties & Peachy Properties",
}: HeaderProps) {
  return (
    <Link to={"/"}>
      <header className="bg-primary text-primary-foreground dark:bg-gray-900 dark:text-gray-100 p-4 flex items-center shadow-md rounded-b-lg">
        {/* App Icon */}
        <img
          src={logoImage}
          alt={`${title} Icon`}
          className="h-10 w-10 mr-3 rounded-full object-cover border-2 border-primary dark:border-blue-400 transition-transform duration-300 hover:scale-105"
        />
        {/* App Title */}
        <h1 className="text-2xl font-semibold tracking-wide">{title}</h1>
      </header>
    </Link>
  );
}
