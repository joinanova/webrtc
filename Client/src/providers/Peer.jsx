import React, { useMemo, useState, useEffect } from "react";
import { useCallback } from "react";

const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) => {

    const [remoteStream, setRemoteStream] = useState(null);

    const peer = useMemo(() => new RTCPeerConnection({
        iceServers:[{
            urls:[
                "stun:stun.l.google.com:19302",
                "stun:global.stun.twilio.com:3478"
            ]
        }]
    }), []);

    const createAnOffer = async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        return offer;
    }

    const createAnAnswer = async (offer) => {
        await peer.setRemoteDescription(offer);
        const answer = peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    }

    const setRemoteAnswer = async(answer) => {
        await peer.setRemoteDescription(answer);
    }

    const sendStream = async(stream) => {
        // Prevent adding tracks multiple times
    const senders = peer.getSenders();
    const tracks = stream.getTracks();

    for (const track of tracks) {
        const alreadyAdded = senders.some(sender => sender.track === track);
        if (!alreadyAdded) {
            peer.addTrack(track, stream);
        }
    }
    }

    const handleTrackEvent = useCallback((ev) => {
        const streams = ev.streams;
        setRemoteStream(streams[0]);
    },[peer]);

    useEffect(() => {
        peer.addEventListener('track', handleTrackEvent);
        return () => {
            peer.removeEventListener('track', handleTrackEvent)
        }
    },[handleTrackEvent, peer])

    return <PeerContext.Provider value={{peer, createAnOffer, createAnAnswer, setRemoteAnswer, sendStream, remoteStream}}>{props.children}</PeerContext.Provider>;
}