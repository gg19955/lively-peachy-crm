import React from "react";
import { Link } from "react-router-dom";

export default function Agreement({ type }: { type: string }) {
  return (
    <p className="text-sm text-gray-700 dark:text-gray-300">
      By {type}, you agree to our{" "}
      <Link
        to="/terms-of-service"
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        to="/privacy-policy"
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
}
