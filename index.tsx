import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import "./globals-crypto.js";
import "./globals.js";
import { AppWrapper } from "./context/ctx.js";

export default function App() {
  const ctx = require.context("./app");

  return (
    <AppWrapper>
      <ExpoRoot context={ctx} />
    </AppWrapper>
  );
}

registerRootComponent(App);
