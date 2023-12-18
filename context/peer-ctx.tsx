// import { PeerId } from "@libp2p/interface-peer-id";
// import type { Connection } from "@libp2p/interface/connection";
import React, { ReactNode, createContext, useContext, useState } from "react";

export interface PeerStats {
  peerIds: any[];
  connected: boolean;
  connections: any[];
  latency: number;
}

export interface PeerContextInterface {
  peerStats: PeerStats;
  setPeerStats: (peerStats: PeerStats) => void;
}
export const peerContext = createContext<PeerContextInterface>({
  peerStats: {
    peerIds: [],
    connected: true,
    connections: [],
    latency: 0,
  },
  setPeerStats: () => {},
});

export const usePeerContext = () => {
  return useContext(peerContext);
};

export const PeerProvider = ({ children }: { children: ReactNode }) => {
  const [peerStats, setPeerStats] = useState<PeerStats>({
    peerIds: [],
    connected: false,
    connections: [],
    latency: 0,
  });

  return (
    <peerContext.Provider value={{ peerStats, setPeerStats }}>
      {children}
    </peerContext.Provider>
  );
};