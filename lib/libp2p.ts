import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { bootstrap } from "@libp2p/bootstrap";
// import type { Message, SignedMessage } from "@libp2p/interface-pubsub";
import { kadDHT } from "@libp2p/kad-dht";
import { webRTC, webRTCDirect } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { webTransport } from "@libp2p/webtransport";
import { Multiaddr } from "@multiformats/multiaddr";
import { createLibp2p, Libp2p } from "libp2p";
import { circuitRelayTransport } from "libp2p/circuit-relay";
import { identifyService } from "libp2p/identify";
import { sha256 } from "multiformats/hashes/sha2";
import {
  CHAT_FILE_TOPIC,
  CHAT_TOPIC,
  WEBRTC_BOOTSTRAP_NODE,
  WEBTRANSPORT_BOOTSTRAP_NODE,
} from "./constants";

export async function startLibp2p() {
  // localStorage.debug = 'libp2p*,-*:trace'
  // application-specific data lives in the datastore

  const libp2p = await createLibp2p({
    addresses: {
      listen: ["/webrtc"],
    },
    transports: [
      webTransport(),
      webSockets({
        filter: filters.all,
      }),
      webRTC({
        rtcConfiguration: {
          iceServers: [
            {
              urls: [
                "stun:stun.l.google.com:19302",
                "stun:global.stun.twilio.com:3478",
              ],
            },
          ],
        },
      }),
      webRTCDirect(),
      circuitRelayTransport({
        discoverRelays: 1,
      }),
    ],
    connectionManager: {
      maxConnections: 10,
      minConnections: 5,
    },
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
      denyDialMultiaddr: async () => false,
    },
    peerDiscovery: [
      bootstrap({
        list: [WEBRTC_BOOTSTRAP_NODE, WEBTRANSPORT_BOOTSTRAP_NODE],
      }),
    ],
    services: {
      pubsub: gossipsub({
        allowPublishToZeroPeers: true,
        msgIdFn: msgIdFnStrictNoSign,
        ignoreDuplicatePublishError: true,
      }),
      dht: kadDHT({
        protocolPrefix: "/universal-connectivity",
        maxInboundStreams: 5000,
        maxOutboundStreams: 5000,
        clientMode: true,
      }),
      identify: identifyService(),
    },
  });

  libp2p.services.pubsub.subscribe(CHAT_TOPIC);
  libp2p.services.pubsub.subscribe(CHAT_FILE_TOPIC);

  libp2p.addEventListener("self:peer:update", ({ detail: { peer } }) => {
    const multiaddrs = peer.addresses.map(({ multiaddr }) => multiaddr);

    console.log(
      `changed multiaddrs: peer ${peer.id.toString()} multiaddrs: ${multiaddrs}`
    );
  });

  return libp2p;
}

// message IDs are used to dedupe inbound messages
// every agent in network should use the same message id function
// messages could be perceived as duplicate if this isnt added (as opposed to rust peer which has unique message ids)
export async function msgIdFnStrictNoSign(msg: any): Promise<Uint8Array> {
  var enc = new TextEncoder();

  const signedMessage = msg as any;
  const encodedSeqNum = enc.encode(signedMessage.sequenceNumber.toString());
  return await sha256.encode(encodedSeqNum);
}

export const connectToMultiaddr =
  (libp2p: Libp2p) => async (multiaddr: Multiaddr) => {
    console.log(`dialling: ${multiaddr.toString()}`);
    try {
      const conn = await libp2p.dial(multiaddr);
      console.info("connected to", conn.remotePeer, "on", conn.remoteAddr);
      return conn;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };