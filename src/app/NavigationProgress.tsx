"use client";

import { AppProgressBar } from "next-nprogress-bar";

export function NavigationProgress() {
  return (
    <AppProgressBar
      color="#0586AD"
      height="4px"
      options={{ showSpinner: true, trickleSpeed: 150, minimum: 0.15 }}
      spinnerPosition="top-right"
    />
  );
}
