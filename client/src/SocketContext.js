import { io } from "socket.io-client";
import Peer from "simple-peer";
import React, { useEffect, useRef, useState } from "react";

const SocketContext = React.createContext();

const socket = io("http://localhost:5000/");

const ContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [me, setMe] = useState("");
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    // get permission's for audio & video
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });

    socket.on("me", (id) => setMe(id));

    socket.on("calluser", ({ from, name: callerName, signal }) => {
      setCall({ isRecievedCall: true, from, name: callerName, signal });
    });
  }, []);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answecall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });
    // getting all the user's information
    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = () => {
    const peer = new Peer({ initiator: true, trickle: false, stream });
  };

  const endCall = () => {};
};
