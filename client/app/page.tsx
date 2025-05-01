import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Mobile/Tablet Layout (stacked vertically) */}
      <div className="md:hidden flex flex-col">
        <div className="w-full min-h-[50vh] flex justify-center items-center p-4">
          <FileUploadComponent />
        </div>
        <div className="w-full min-h-[50vh] border-t-2 border-gray-700">
          <ChatComponent />
        </div>
      </div>

      {/* Desktop Layout (side by side) */}
      <div className="hidden md:flex min-h-screen w-full">
        <div className="w-full md:w-[40%] lg:w-[35%] min-h-screen flex justify-center items-center p-4">
          <FileUploadComponent />
        </div>
        <div className="w-full md:w-[60%] lg:w-[65%] min-h-screen border-l-2 border-gray-700">
          <ChatComponent />
        </div>
      </div>
    </div>
  );
}