import { Phone, Video, ArrowLeft } from "lucide-react"; // ArrowLeft import kiya
import { useAuthStore } from "../Store/useAuth.Store.js";
import { useChatStore } from "../Store/useChat.Store.js";
import { X } from "lucide-react"

const ChatHeader = ({ onStartCall }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isSelf = selectedUser._id === authUser?._id;

  return (
    <div className="p-2.5 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Mobile Back Button: Sirf mobile par dikhega, Click karne par user list wapas layega */}
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-ghost btn-circle btn-sm md:hidden mr-1"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="object-cover rounded-full"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-base-100" />
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-sm sm:text-base">
              {selectedUser.fullName}
            </h3>
            <p className="text-xs text-base-content/70">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartCall("audio")}
            disabled={!isOnline || isSelf}
            className="btn btn-ghost btn-circle btn-sm disabled:opacity-40"
            title={
              !isOnline
                ? "User is offline"
                : isSelf
                  ? "Cannot call yourself"
                  : "Voice Call"
            }
          >
            <Phone
              size={18}
              className={isOnline && !isSelf ? "text-success" : ""}
            />
          </button>

          <button
            onClick={() => onStartCall("video")}
            disabled={!isOnline || isSelf}
            className="btn btn-ghost btn-circle btn-sm disabled:opacity-40"
            title={
              !isOnline
                ? "User is offline"
                : isSelf
                  ? "Cannot call yourself"
                  : "Video Call"
            }
          >
            <Video
              size={18}
              className={isOnline && !isSelf ? "text-primary" : ""}
            />
          </button>

          {/* Desktop Close Button: Ab yeh button mobile par hidden hoga kyunki left par Back Arrow aa gaya hai */}
          <button
            onClick={() => setSelectedUser(null)}
            className="hidden md:flex btn btn-ghost btn-circle btn-sm text-error ml-2"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;