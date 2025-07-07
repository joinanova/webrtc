import React, { useEffect, useCallback } from "react";
import { useSocket } from '../providers/Socket';
import { usePeer } from '../providers/Peer';

const RoomPage = () => {
    const { socket } = useSocket();
    const { peer, createAnOffer, createAnAnswer, setRemoteAnswer } = usePeer();

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

    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined);
        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted', handleCallAccepted);

        return () => {
            socket.off('user-joined', handleNewUserJoined);
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleCallAccepted);
        }
    }, [handleCallAccepted, handleNewUserJoined, handleIncomingCall, socket])

    return (
        <div className="room-page-container">
            <h1>Room Page</h1>
        </div>
    )
}

export default RoomPage;