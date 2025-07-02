import React, {useEffect} from 'react';
import { useSocket } from '../providers/Socket';

const HomePage = () => {
    const { socket } = useSocket();

    useEffect(() => {
        if(socket){
            socket.emit("join-room", {
                emailId: "user@example.com",
                roomId: "12345"
            });
        }
    }, [socket]);

    console.log("Socket:", socket);

    return (
        <div className="homepage-container">
            <div className='input-container'>
                <input type="email" placeholder='Enter email'/>
                <input type="text" placeholder='Enter room code'/>
                <button>Enter room</button>
            </div>
        </div>
    );
}

export default HomePage;