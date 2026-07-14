import { useChatStore } from "../Store/useChat.Store.js";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { useAuthStore } from "../Store/useAuth.Store.js";
import { useCallStore } from "../Store/useCallStore.js";
import { formatMessageTime } from "../lib/utils.js";
import CallWindow from "./CallWindow.jsx";
import { Phone, PhoneOff } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);

  const { call, initiateCallListeners, resetCallState, callEnded } =
    useCallStore();
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    if (socket) {
      initiateCallListeners(socket);
    }

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    initiateCallListeners,
    socket,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

useEffect(() => {
    if (callEnded) {
      console.log("Call ended signal received. Closing UI.");
      setActiveCall(null);  
      resetCallState();     
    }
  }, [callEnded, resetCallState]);

  const handleStartCall = (type) => {
    setActiveCall({
      isCaller: true,
      targetUser: selectedUser,
      callType: type,
    });
  };

  const handleAcceptCall = () => {
    setActiveCall({
      isCaller: false,
      targetUser: { _id: call.from, fullName: call.name },
      callType: call.callType,
    });
  };

  const handleRejectCall = () => {
    if (socket) {
      socket.emit("end-call", { to: call.from });
    }
    resetCallState();
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader onStartCall={handleStartCall} />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto relative bg-base-100">
      <ChatHeader onStartCall={handleStartCall} />

      {call?.isReceivingCall && !activeCall && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-base-100 border border-base-300 shadow-2xl rounded-2xl p-4 flex items-center gap-6 z-50 w-11/12 max-w-md animate-bounce">
          <div className="flex-1">
            <span className="badge badge-primary text-xs font-semibold mb-1">
              INCOMING {call.callType?.toUpperCase()} CALL
            </span>
            <p className="text-sm font-bold text-base-content">
              {call.name || "Someone"} is calling you...
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAcceptCall}
              className="btn btn-success btn-sm btn-circle text-green-600 shadow-md"
            >
              <Phone size={16} />
            </button>
            <button
              onClick={handleRejectCall}
              className="btn btn-error btn-sm btn-circle text-red-600 shadow-md"
            >
              <PhoneOff size={16} />
            </button>
          </div>
        </div>
      )}

      {activeCall && (
        <div className="absolute inset-0 z-40 bg-black">
          <CallWindow
            activeCall={activeCall}
            socketInstance={socket}
            onLeaveCall={() => {
              setActiveCall(null);
              resetCallState();
            }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
