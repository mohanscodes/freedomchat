import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { socket } from "../utils/utils";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { get_my_friends, messageClear } from "../store/Reducers/chatReducer";
import notificationSound from "../assets/sounds/notification.mp3";

const MainLayout = () => {
  const dispatch = useDispatch();
  const [showSidebar, setShowSidebar] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      const sound = new Audio(notificationSound);
      const playPromise = sound.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Notification sound played successfully.");
          })
          .catch((error) => {
            console.error("Playback failed:", error);
          });
      }

      toast.success(`${msg.senderName} sent a message`);
      dispatch(messageClear());
    };

    socket.on("resive_user_message", handleReceiveMessage);

    // Cleanup the event listener on component unmount
    return () => {
      socket.off("resive_user_message", handleReceiveMessage);
    };
  }, [dispatch]);

  // Register user to socket and get friends list
  useEffect(() => {
    if (userInfo._id) {
      socket.connect();
      socket.emit("add_user", userInfo._id, userInfo);
      dispatch(get_my_friends(userInfo._id));
    } else {
      socket.disconnect();
      console.log("logout");
    }
  }, [userInfo._id, userInfo, dispatch]);

  return (
    <div
      className="w-full min-h-screen"
      style={{
        backgroundImage: `url("/bg.jpg")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <Header showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <div className="ml-0 lg:ml-[280px] pt-[95px] transition-all">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
