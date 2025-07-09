import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSocket } from '../providers/Socket';
import { usePeer } from '../providers/Peer';
import ReactPlayer from 'react-player';

const RoomPage = () => {
    const { socket } = useSocket();
    const { peer, createAnOffer, createAnAnswer, setRemoteAnswer, sendStream, remoteStream } = usePeer();

    const [myStream, setMyStream] = useState(null);
    const [remoteEmailId, setRemoteEmailId] = useState();
    const myVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data;
        console.log('New user joined room', emailId);
        
        // Create and send offer
        console.log('Creating offer...')
        const offer = await createAnOffer();
        console.log("Offer created => ", offer)

        socket.emit('call-user', { emailId, offer });
        setRemoteEmailId(emailId);
    }, [createAnOffer, socket]);

    const handleIncomingCall = useCallback(async(data) => {
        const {from, offer} = data;
        console.log("Incoming call from ", from, "with offer: ", offer);

        const ans = await createAnAnswer(offer);
        socket.emit('call-accepted', {emailId: from, answer: ans});
        
        setRemoteEmailId(from);
    }, [createAnAnswer, socket]);

    const handleCallAccepted = useCallback(async(data) => {
        const {answer} = data;
        console.log("Call got accepted", answer);
        await setRemoteAnswer(answer);
    },[setRemoteAnswer])

    const getUserMediaStream = useCallback(async() => {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        setMyStream(stream);
        // Send stream immediately when it's available
        await sendStream(stream);
    }, [sendStream]);

    const handleNegotiation = useCallback(async () => {
        console.log("Negotiation needed, creating new offer");
        const localOffer = await createAnOffer();
        socket.emit('call-user', {emailId: remoteEmailId, offer: localOffer});
    }, [createAnOffer, remoteEmailId, socket]);

    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined);
        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted', handleCallAccepted);

        return () => {
            socket.off('user-joined', handleNewUserJoined);
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleCallAccepted);
        }
    }, [handleCallAccepted, handleNewUserJoined, handleIncomingCall, socket]);

    useEffect(() => {
        getUserMediaStream();
    }, [getUserMediaStream]);

    useEffect(() => {
        if (myVideoRef.current && myStream) {
            myVideoRef.current.srcObject = myStream;
            console.log("My video stream set:", myStream);
        }
    }, [myStream]);

    useEffect(() => {
        if(remoteVideoRef.current && remoteStream){
            remoteVideoRef.current.srcObject = remoteStream;
            console.log("Remote video stream set:", remoteStream);
        }
    },[remoteStream]);

    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegotiation);
        return () => {
            peer.removeEventListener('negotiationneeded', handleNegotiation);
        }
    }, [handleNegotiation, peer]);

    return (
        <div className="room-page-container">
            <h1>Room Page</h1>
            <h4>You are connected to {remoteEmailId}</h4>
            {/* <ReactPlayer url={myStream} playing /> */}
            {/* <button className="hover:bg-green-700" onClick={e => sendStream(myStream)}>Send stream</button> */}
            <video
                ref={myVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "400px" }}
            />
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "400px" }}
            />
        </div>
    )
}

export default RoomPage;