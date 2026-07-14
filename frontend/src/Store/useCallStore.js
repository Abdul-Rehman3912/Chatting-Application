import { create } from "zustand";

export const useCallStore = create((set, get) => ({
  localStream: null,
  remoteStream: null,
  callStatus: "idle", 
  peerConnection: null,
  callEnded: false,

  call: {
    isReceivingCall: false,
    from: null,      
    name: "",        
    callType: null,  
    offer: null,     
  },

  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  setCallStatus: (status) => set({ callStatus: status }),
  
  resetCallState: () => {
    const { localStream, remoteStream } = get();
    
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop(); 
        console.log(`Stopped track: ${track.kind}`);
      });
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    set({
      localStream: null,
      remoteStream: null,
      callStatus: "idle",
      peerConnection: null,
      callEnded: false,
      call: {
        isReceivingCall: false,
        from: null,
        name: "",
        callType: null,
        offer: null,
      },
    });
  },

  initiateCallListeners: (socket) => {
    if (!socket) return;

    socket.off("incoming-call").on("incoming-call", ({ from, name, offer, type }) => {
      set({
        call: {
          isReceivingCall: true,
          from,
          name,
          callType: type,
          offer,
        },
        callEnded: false,
      });
    });

    socket.off("call-ended").on("call-ended", () => {
      console.log("Opponent ended the call.");
      set({ callEnded: true });
    });
  },
}));