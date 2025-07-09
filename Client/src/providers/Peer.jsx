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
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    }

    const setRemoteAnswer = async(answer) => {
        await peer.setRemoteDescription(answer);
    }

    const sendStream = async(stream) => {
        console.log("Sending stream:", stream);
        // Clear existing tracks first
        const senders = peer.getSenders();
        for (const sender of senders) {
            if (sender.track) {
                peer.removeTrack(sender);
            }
        }

        // Add new tracks
        const tracks = stream.getTracks();
        console.log("Adding tracks:", tracks);
        for (const track of tracks) {
            peer.addTrack(track, stream);
        }
        console.log("All tracks added to peer connection");
    }

    const handleTrackEvent = useCallback((ev) => {
        console.log("Track event received:", ev);
        const streams = ev.streams;
        console.log("Remote streams:", streams);
        if (streams && streams[0]) {
            setRemoteStream(streams[0]);
        }
    }, []);

    useEffect(() => {
        peer.addEventListener('track', handleTrackEvent);
        return () => {
            peer.removeEventListener('track', handleTrackEvent)
        }
    },[handleTrackEvent, peer])

    return <PeerContext.Provider value={{peer, createAnOffer, createAnAnswer, setRemoteAnswer, sendStream, remoteStream}}>{props.children}</PeerContext.Provider>;
}