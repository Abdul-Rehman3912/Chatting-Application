import { useEffect, useRef } from "react";
import { useWebRTC } from "../hooks/useWebRTC.js";
import { useCallStore } from "../Store/useCallStore.js";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

const CallWindow = ({ activeCall, socketInstance, onLeaveCall }) => {
  const { initiateCall, answerCall, endCall } = useWebRTC();
  const { localStream, remoteStream, callStatus, call } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (activeCall.isCaller) {
      initiateCall(activeCall.targetUser._id, activeCall.callType);
    } else {
      answerCall(call.offer, call.from);
    }
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleHangUp = () => {
    const targetId = activeCall.isCaller
      ? activeCall.targetUser._id
      : call.from;
    endCall(targetId);
    onLeaveCall();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between bg-neutral text-neutral-content p-6 relative">
      <div className="text-center mt-4">
        <h2 className="text-xl font-bold">{activeCall.targetUser.fullName}</h2>
        <span className="badge badge-outline mt-2 tracking-wider capitalize">
          {callStatus === "connected" ? "On Call" : `${callStatus}...`}
        </span>
      </div>

      <div className="flex-1 w-full flex items-center justify-center gap-4 my-4 relative">
        {activeCall.callType === "video" ? (
          <div className="w-full h-full max-w-2xl relative bg-black/40 rounded-2xl overflow-hidden border border-neutral-focus">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Connecting partner...
              </div>
            )}

            {localStream && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute bottom-4 right-4 w-32 sm:w-40 aspect-video object-cover rounded-xl border-2 border-white shadow-2xl z-10"
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="avatar placeholder animate-pulse">
              <div className="bg-neutral-focus text-neutral-content rounded-full w-24">
                <span className="text-3xl">
                  {activeCall.targetUser.fullName[0]}
                </span>
              </div>
            </div>
            {localStream && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="hidden"
              />
            )}
            {remoteStream && (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="hidden"
              />
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4 z-10">
        <button
          onClick={handleHangUp}
          className="btn btn-error btn-circle btn-lg text-red-700 shadow-lg hover:scale-110 transition-transform"
          title="End Call"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export default CallWindow;
