"use client";

import { AppProgressBar } from "next-nprogress-bar";

export function NavigationProgress() {
  return (
    <AppProgressBar
      color="#0586AD"
      height="3px"
      options={{ showSpinner: true, trickleSpeed: 180 }}
      shallowRouting
      spinnerPosition="top-right"
    />
  );
}
