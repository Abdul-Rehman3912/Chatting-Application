import { useChatStore } from "../Store/useChat.Store.js";
import Sidebar from "../components/sidebar.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import ChatContainer from "../components/ChatContainer.jsx";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            
            {/* Sidebar Container */}
            {/* md:flex: Laptop screen par force karega ke flex layout ke sath sidebar hamesha active rahe */}
            {/* mobile par (!selectedUser ? 'flex' : 'hidden') logic chalegi */}
            <div className={`h-full ${!selectedUser ? "flex w-full" : "hidden"} md:flex md:w-80 lg:w-72 border-r border-base-300`}>
              <Sidebar />
            </div>

            {/* Chat Container Box */}
            {/* md:flex: Laptop/Desktop par selectedUser true ho ya false, content area hamesha flex rahega */}
            {/* mobile par (selectedUser ? 'flex' : 'hidden') logic chalegi */}
            <div className={`flex-1 h-full ${selectedUser ? "flex flex-col" : "hidden"} md:flex md:flex-col`}>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;