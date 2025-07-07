import React, { useEffect, useCallback } from "react";
import { useSocket } from '../providers/Socket';
import { usePeer } from '../providers/Peer';

const RoomPage = () => {
    const { socket } = useSocket();
    const { peer, createAOffer } = usePeer();

    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data;
        console.log('New user joined room', emailId);
        const offer = await createAOffer();

        socket.emit('call-user', { emailId, offer })
    }, [createAOffer, socket]);

    const handleIncomingCall = useCallback((data) => {
        const {from, offer} = data;
        console.log("Incoming call from ", from, "with offer: ", offer);
    }, [])

    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined);
        socket.on('incoming-call', handleIncomingCall);
    }, [socket])

    return (
        <div className="room-page-container">
            <h1>Room Page</h1>
        </div>
    )
}

export default RoomPage;