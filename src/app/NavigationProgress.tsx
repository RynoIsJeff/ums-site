"use client";

import { AppProgressBar } from "next-nprogress-bar";

export function NavigationProgress() {
  return (
    <AppProgressBar
      color="#0A2FFF"
      height="3px"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
