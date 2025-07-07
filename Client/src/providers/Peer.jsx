import React, { useMemo } from "react";

const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) => {
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
        const tracks = stream.getTracks();
        for(const track of tracks){
            peer.addTrack(track, stream);
        }
    }

    return <PeerContext.Provider value={{peer, createAnOffer, createAnAnswer, setRemoteAnswer, sendStream}}>{props.children}</PeerContext.Provider>;
}