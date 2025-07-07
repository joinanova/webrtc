import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSocket } from '../providers/Socket';
import { usePeer } from '../providers/Peer';
import ReactPlayer from 'react-player';

const RoomPage = () => {
    const { socket } = useSocket();
    const { peer, createAnOffer, createAnAnswer, setRemoteAnswer } = usePeer();

    const [myStream, setMyStream, sendStream] = useState(null);
    const myVideoRef = useRef(null);

    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data;
        console.log('New user joined room', emailId);

        console.log('Offer creating...')
        const offer = await createAnOffer();
        console.log("Offer created => ",offer)

        socket.emit('call-user', { emailId, offer })
    }, [createAnOffer, socket]);

    const handleIncomingCall = useCallback(async(data) => {
        const {from, offer} = data;
        console.log("Incoming call from ", from, "with offer: ", offer);

        const ans = await createAnAnswer(offer);
        socket.emit('call-accepted', {emailId: from, answer: ans});
    }, [createAnAnswer, socket]);

    const handleCallAccepted = useCallback(async(data) => {
        const {answer} = data;
        console.log("Call got accepted", answer);
        await setRemoteAnswer(answer);
    },[setRemoteAnswer])

    const getUserMediaStream = useCallback(async() => {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        // sendStream(stream);
        setMyStream(stream);
    }, [sendStream, setMyStream]);

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
        }
    }, [myStream]);

    return (
        <div className="room-page-container">
            <h1>Room Page</h1>
            {/* <ReactPlayer url={myStream} playing /> */}
            <video
                ref={myVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "400px" }}
            />
        </div>
    )
}

export default RoomPage;