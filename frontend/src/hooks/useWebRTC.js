import { useEffect, useRef } from "react";
import { useCallStore } from "../Store/useCallStore.js";
import { useAuthStore } from "../Store/useAuth.Store.js";

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = () => {
  const {
    localStream,
    setLocalStream,
    setRemoteStream,
    setCallStatus,
    resetCallState,
    call,
  } = useCallStore();

  const { authUser, socket } = useAuthStore();
  const pc = useRef(null);

  const startLocalStream = async (type = "video") => {
    try {
      const constraints = {
        audio: true,
        video: type === "video" ? { width: 640, height: 480 } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("Camera/Mic access error:", err);
    }
  };

const createPeerConnection = (targetUserId, stream) => {
  pc.current = new RTCPeerConnection(iceServers);

  if (stream) {
    stream.getTracks().forEach((track) => {
      pc.current.addTrack(track, stream);
    });
    console.log("Local tracks added to Peer Connection");
  }

  pc.current.ontrack = (event) => {
    console.log("Remote stream track received!", event.streams[0]);
    if (event.streams && event.streams[0]) {
      setRemoteStream(event.streams[0]);
    }
  };

  pc.current.onicecandidate = (event) => {
    if (event.candidate && socket) {
      socket.emit("ice-candidate", { to: targetUserId, candidate: event.candidate });
    }
  };
};

  const initiateCall = async (targetUserId, type = "video") => {
    if (!socket) return;
    setCallStatus("ringing");
    const stream = await startLocalStream(type);
    createPeerConnection(targetUserId, stream);

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    socket.emit("call-user", {
      to: targetUserId,
      offer,
      from: socket.id,
      name: authUser?.fullName || "User",
      type,
    });
  };


const answerCall = async (incomingOffer, senderSocketId) => {
  if (!socket) return;
  setCallStatus("connected");
  
  const stream = await startLocalStream(call.callType || "video"); 
  createPeerConnection(senderSocketId, stream);

  await pc.current.setRemoteDescription(new RTCSessionDescription(incomingOffer));
  const answer = await pc.current.createAnswer();
  await pc.current.setLocalDescription(answer);

  socket.emit("answer-call", { to: senderSocketId, answer });
};

const endCall = (targetUserId) => {
    if (pc.current) {
      pc.current.getSenders().forEach(sender => {
        if (sender.track) sender.track.stop(); 
      });
      pc.current.close();
      pc.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (socket && targetUserId) {
      socket.emit("end-call", { to: targetUserId });
    }

    resetCallState();
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("call-accepted", async ({ answer }) => {
      setCallStatus("connected");
      if (pc.current) {
        await pc.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (pc.current && candidate) {
        try {
          if (pc.current.signalingState !== "closed") {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("Candidate added successfully!");
      }
        } catch (e) {
          console.error("Error adding ice candidate:", e);
        }
      }
    });

    socket.on("call-ended", () => {
      if (pc.current) {
        pc.current.close();
        pc.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      resetCallState();
    });

    return () => {
      socket.off("call-accepted");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, [socket, localStream, resetCallState, setCallStatus]);

  return { initiateCall, answerCall, endCall, startLocalStream };
};
