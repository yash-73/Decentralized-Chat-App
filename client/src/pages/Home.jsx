import { useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../provider/Socket";
import JoinRoom from "../components/JoinRoom";
import CreateRoom from "../components/CreateRoom";
import { useDispatch } from "react-redux";
import { createRoom } from "../store/roomSlice";
import NavBar from "../components/NavBar";
import { MdOutlineLaptopWindows } from "react-icons/md";
import { BsFillChatTextFill } from "react-icons/bs";
import { FcVideoCall } from "react-icons/fc";
import { RiFolderSharedFill } from "react-icons/ri";
import { RiP2pFill } from "react-icons/ri";

import "./Home.css";

function Home() {
  const home_ref = useRef(null);
  const about_ref = useRef(null);
  const create_room_ref = useRef(null);
  const join_room_ref = useRef(null);
  const features_parent = useRef(null)

  const navElements = [
    {
      name: "Home",
      ref: home_ref,
    },
    {
      name: "Create Room",
      ref: create_room_ref,
    },
    {
      name: "Join Room",
      ref: join_room_ref,
    },
    {
      name: "About",
      ref: about_ref,
    },
  ];

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();

  const aniref = useRef(null);

  useEffect(()=>{
    if(features_parent.current){
        const observer = new IntersectionObserver((entries)=>{
            entries.forEach((entry)=>{
                if (entry.isIntersecting){
                    const children = entry.target.children;
                    for(let i =0; i<children.length; i++){
                        const child = children.item(i);
                        child.classList.add('slideLeftToRight');
                    }
                }
            })
        })

        observer.observe(features_parent.current);
        }
  },[])

  useEffect(() => {
    const objectsToAnimateParent = document.querySelector(".toAnimateParent");
    // console.log(objectsToAnimate.forEach(animateObject =>{console.log(animateObject)}))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const children = entry.target.children;
          for(let i =0; i<children.length; i++){
            const child = children.item(i);
            child.classList.add('rotate_animation');
        }
        }
      });
    });
    observer.observe(objectsToAnimateParent)

    
  }, []);
  useEffect(() => {
    if (aniref.current) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const children = entry.target.children;

          if (entry.isIntersecting) {
            for (let i = 0; i < children.length; i++) {
              const child = children.item(i);
              child.classList.add("show");
            }
          }
        });
      });

      observer.observe(aniref.current);
    }
  }, []);

  const handleRoomCreate = async (username, roomNum, roomPassword) => {
    socket.emit("create-room", { roomNum, roomPassword });
    handleJoinRoom(username, roomNum, roomPassword);
  };
  const handleJoinRoom = useCallback(
    (username, roomNum, roomPassword) => {
      console.log(
        "Sending join room request now from",
        username,
        "to room",
        roomNum
      );
      socket.emit("join-req", {
        from: username,
        room: roomNum,
        roomPass: roomPassword,
      });
    },
    [socket]
  );

  const handleJoiningRoom = useCallback(
    (data) => {
      console.log("Joining room", data.roomNum);
      console.log(data);
      dispatch(createRoom({ roomData: data }));
      navigate(`/room/${data.roomNum}`);
    },
    [navigate, dispatch]
  );

  useEffect(() => {
    socket.on("room-created", () => {
      console.log("Room created ");
    });
    socket.on("wrong-password", () => {
      setError("Wrong password");
    });
    socket.on("no-room-found", () => {
      setError("No Room found");
    });
    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("disconnect", () => console.log("Socket disconnected"));
    socket.on("joining-room", handleJoiningRoom);

    return () => {
      socket.off("room-created");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("joining-room");
      socket.off("wrong-password");
      socket.off("no-room-found");
    };
  }, [socket, handleJoiningRoom, handleJoinRoom]);

  return (
        <div className="flex bg-black text-white">
            <div ref={home_ref}></div>
            <div className="w-[250px] h-screen sticky top-0 left-0 z-10 overflow-y-auto">
                <nav
                    className={` flex flex-col bg-black  text-white justify-start items-start px-8 `}>
                    <div
                        onClick={() => {location.reload();}}
                        className="hover:cursor-pointer text-teal-400 font-sans  my-8 px-4 font-bold text-2xl">
                        whisperNet
                    </div>

                    {navElements.map((item) => (
                        <button onClick={() =>
                            item.ref.current?.scrollIntoView({
                                behavior: "smooth",
                            })}
                            className="text-left px-4 py-1 rounded-x w-full rounded my-2 font-medium text-lg  hover:bg-gray-400/45 hover:text-white  transition-all duration-100  "
                            key={item.name}>
                            {" "}
                            {item.name}
                        </button>))
                    }
                </nav>
            </div>

            <div className="px-8 flex-1 border-2 border-gray-500">
                <h2 className=" w-full text-center text-[80px] mb-8 mt-16 break-words font-bold">
                    Chat with your friends with complete privacy
                 </h2>

                <div className="w-full flex relative flex-col justify-evenly my-[150px] items-center overflow-hidden">
                <div className="flex flex-row items-center justify-evenly w-full">
                    <div className=" p-[30px] border-gray-900 border-4 bg-black rounded-full">
                        <RiP2pFill className="text-[130px] text-red-500" />
                    </div>
                    <p className=" text-[30px] text-center break-words font-semibold w-[60%]">
                        Establish a complete peer-to-peer network using WebRTC
                    </p>
                </div>
                <div className="lpbot text-white "></div>
            </div>

            <div ref={aniref} className=" flex flex-row justify-evenly w-full py-8">
                <div className=" hider text-center">
                    <div className="p-[30px] border-gray-400 border-4 rounded-full w-fit">
                        <BsFillChatTextFill className="text-[80px] text-blue-500" />
                    </div>
                    <p className="m-2">Chat with friends</p>
                </div>

                <div className=" hider text-center">
                    <div className="p-[30px] border-gray-400 border-4 rounded-full w-fit">
                        <FcVideoCall className="text-[80px]" />
                    </div>
                    <p className="m-2">Video Call</p>
                </div>

                <div className="hider text-center">
                    <div className="p-[30px] border-gray-400 border-4 rounded-full w-fit">
                        <RiFolderSharedFill className="text-[80px] text-yellow-500" />
                    </div>
                    <p className="m-2">Share files</p>
                </div>
            </div>

            <div
                ref={create_room_ref}
                className="h-[100vh] my-10 flex flex-col justify-evenly  items-center">
                <h3 className="w-full text-center text-[25px] font-semibold">
                Create a Room
                </h3>
                <CreateRoom handleRoomCreate={handleRoomCreate} className={"w-[300px]"} />
            </div>

            <div
                ref={join_room_ref}
                className="h-[100vh] my-10 flex flex-col justify-evenly  items-center">
                <h3 className="w-full text-center text-[25px] font-semibold">
                    Start communicating with friends
                </h3>
                <JoinRoom handleJoinRoom={handleJoinRoom} className={"w-[300px]"} />
            </div>

            <div
                className="flex flex-col items-center w-full relative overflow-hidden"
                ref={about_ref}>
                <h1 className="text-[50px] text-center w-full font-bold text-teal-400 mt-8 m-8">
                    whisperNet
                </h1>
                <div className="flex flex-col justify-evenly text-center w-[80%]  text-xl">
                    <div className="z-20 ">
                        <p className="text-teal-400 inline">
                            whisperNet 
                        </p> is a
                        decentralized chat application that aims to achieve complete
                        privacy for chatting and sharing files.
                    </div>
                <div className="z-20 border-b-2 border-white pb-8">
                    It allows users to communicate securely using WebRTC technology.It
                    also supports file sharing directly between peers without relying
                    on central servers
                </div>

                <div className="flex flex-col w-full  mt-4">
                    <h3 className="z-20 text-[25px] mb-8 ">
                        How it works?
                    </h3>

                    <div className="flex flex-row justify-between">
                        <div className="w-[50%] font-semibold text-[25px] z-20 bg-teal-800 m-4 rounded-xl p-8 text          border-white border-2 flex flex-row items-center px-4 ">
                            whisperNet uses the WebRTC protocol to establish connection
                            between two peers
                        </div>
                        <div
                            id="webrtc_logo_animation"
                            className=" items-end   flex flex-col z-10">
                            <svg
                                className=" w-[400px] overflow-visible"
                                viewBox="0 -3.5 256 256"
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                preserveAspectRatio="xMidYMid"
                                fill="#000000">
                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                                ></g>
                                <g id="SVGRepo_iconCarrier">
                      {" "}
                      <g className="toAnimateParent">
                        {" "}
                        <path
                          className="toAnimate one "
                          d="M142.076578,191.086817 C142.076578,159.280656 116.294759,133.494615 84.4885969,133.494615 C52.6782136,133.494615 26.896394,159.280656 26.896394,191.086817 C26.896394,222.892979 52.6782136,248.67902 84.4885969,248.67902 C116.294759,248.67902 142.076578,222.892979 142.076578,191.086817"
                          fill="#FF6600"
                          transform="translate(84.486486, 191.086817) scale(1, -1) translate(-84.486486, -191.086817) "
                        >
                          {" "}
                        </path>{" "}
                        <path
                          className="toAnimate two"
                          d="M255.979703,110.454356 C255.979703,78.652416 230.197884,52.862153 198.391722,52.862153 C166.581339,52.862153 140.799519,78.652416 140.799519,110.454356 C140.799519,142.260518 166.581339,168.050781 198.391722,168.050781 C230.197884,168.050781 255.979703,142.260518 255.979703,110.454356"
                          fill="#FFCC00"
                          transform="translate(198.389611, 110.456467) scale(1, -1) translate(-198.389611, -110.456467) "
                        >
                          {" "}
                        </path>{" "}
                        <path
                          className="toAnimate three"
                          d="M115.200498,109.176452 C115.200498,77.3745125 89.4186786,51.5842495 57.6082953,51.5842495 C25.8063553,51.5842495 0.0203140271,77.3745125 0.0203140271,109.176452 C0.0203140271,140.982614 25.8063553,166.772877 57.6082953,166.772877 C89.4186786,166.772877 115.200498,140.982614 115.200498,109.176452"
                          fill="#0089CC"
                          transform="translate(57.610406, 109.178563) scale(1, -1) translate(-57.610406, -109.178563) "
                        >
                          {" "}
                        </path>{" "}
                        <path
                          className="toAnimate one"
                          d="M230.385749,191.086817 C230.385749,159.280656 204.603929,133.494615 172.789324,133.494615 C140.987384,133.494615 115.201343,159.280656 115.201343,191.086817 C115.201343,222.892979 140.987384,248.67902 172.789324,248.67902 C204.603929,248.67902 230.385749,222.892979 230.385749,191.086817"
                          fill="#009939"
                          transform="translate(172.793546, 191.086817) scale(1, -1) translate(-172.793546, -191.086817) "
                        >
                          {" "}
                        </path>{" "}
                        <path
                          className="toAnimate two"
                          d="M185.592001,57.9843213 C185.592001,26.1781597 159.805959,0.392118349 127.999798,0.392118349 C96.1936359,0.392118349 70.4075946,26.1781597 70.4075946,57.9843213 C70.4075946,89.790483 96.1936359,115.576524 127.999798,115.576524 C159.805959,115.576524 185.592001,89.790483 185.592001,57.9843213"
                          fill="#BF0000"
                          transform="translate(127.999798, 57.984321) scale(1, -1) translate(-127.999798, -57.984321) "
                        >
                          {" "}
                        </path>{" "}
                        <path
                          className="toAnimate three"
                          d="M140.798675,57.9788331 C140.798675,56.76721 140.904217,55.580917 140.980207,54.3861807 C166.525612,60.2796505 185.590734,83.1189569 185.590734,110.454356 C185.590734,111.665979 185.485192,112.856494 185.409202,114.05123 C159.863796,108.153539 140.798675,85.3142322 140.798675,57.9788331"
                          fill="#FC0007"
                          transform="translate(163.194704, 84.218705) scale(1, -1) translate(-163.194704, -84.218705) "
                        >
                          {" "}
                        </path>{" "}
                        <path
                          className="toAnimate one"
                          d="M148.39686,162.570614 C158.322038,145.219495 176.973434,133.495881 198.394255,133.495881 C207.124696,133.495881 215.369643,135.496959 222.787141,138.975626 C212.866185,156.326744 194.214789,168.050358 172.789746,168.050358 C164.059305,168.050358 155.814358,166.049281 148.39686,162.570614"
                          fill="#1CD306"
                          transform="translate(185.592001, 150.773120) scale(1, -1) translate(-185.592001, -150.773120) "
                        >
                          {" "}
                        </path>{" "}
                        <path
                          className="toAnimate two"
                          d="M115.200498,191.086817 C115.200498,177.015947 120.258075,164.139813 128.642338,154.138646 C137.018157,164.139813 142.075734,177.015947 142.075734,191.086817 C142.075734,205.157688 137.018157,218.033822 128.642338,228.034989 C120.258075,218.033822 115.200498,205.157688 115.200498,191.086817"
                          fill="#0F7504"
                          transform="translate(128.638116, 191.086817) scale(1, -1) translate(-128.638116, -191.086817) "
                        >
                          {" "}
                        </path>{" "}
                        <path
                          className="toAnimate three"
                          d="M34.806984,138.212768 C41.8023132,135.190043 49.5026635,133.497148 57.6082953,133.497148 C78.818032,133.497148 97.2963396,144.992791 107.293286,162.061056 C100.297956,165.083782 92.5933844,166.772455 84.4919743,166.772455 C63.2822376,166.772455 44.7997083,155.276811 34.806984,138.212768"
                          fill="#0C5E87"
                          transform="translate(71.050135, 150.134801) scale(1, -1) translate(-71.050135, -150.134801) "
                        >
                          {" "}
                        </path>{" "}
                        <path
                          className="toAnimate one"
                          d="M70.6545631,114.036032 C70.5194692,112.431792 70.4054838,110.819109 70.4054838,109.176875 C70.4054838,81.862584 89.4410536,59.044386 114.956907,53.1255861 C115.087779,54.7298257 115.201765,56.3425087 115.201765,57.9805218 C115.201765,85.2948125 96.1704167,108.121454 70.6545631,114.036032"
                          fill="#6B0001"
                          transform="translate(92.803624, 83.580809) scale(1, -1) translate(-92.803624, -83.580809) "
                        >
                          {" "}
                        </path>{" "}
                        <path
                          className="toAnimate vanish "
                          d="M76.0304545,111.503866 L67.0213825,111.503866 C59.0677312,111.503866 52.6001125,117.950377 52.6001125,125.88292 L52.6001125,207.428953 C52.6001125,215.361496 59.0677312,221.812228 67.0213825,221.812228 L179.989405,221.812228 C187.943056,221.812228 194.406453,215.361496 194.406453,207.428953 L194.406453,125.88292 C194.406453,117.950377 187.943056,111.503866 179.989405,111.503866 L141.50454,111.503866 L64.2899534,73.6522544 L76.0304545,111.503866 L76.0304545,111.503866 Z"
                          fill="#FFFFFF"
                          transform="translate(123.503283, 147.732241) scale(1, -1) translate(-123.503283, -147.732241) "
                        >
                          {" "}
                        </path>{" "}
                      </g>{" "}
                                </g>
                            </svg>
                        </div>
                    </div>

                    <div className="w-full flex flex-col items-center my-[150px] ">
                        <h3 className="text-teal-400 text-[30px] font-bold border-teal-400 border-b-2">Features</h3>

                        <div ref={features_parent} className=" w-[80%] flex-flex-col">
                        <p className="feat_main py-2 my-6 bg-[#bf0000db] rounded-md  ">Decentralized one-to-one chat</p>
                        <p className="feat_main py-2 my-6 bg-[#0089ccdb] rounded-md ">Secure communication using WebRTC</p>
                        <p className="feat_main py-2 my-6 bg-[#ffcc00db] rounded-md  ">Peer-to-peer file sharing (images, videos, and documents)</p>
                        <p className="feat_main py-2 my-6 bg-[#ffffffdb] text-black rounded-md  ">Lightweight and fast performance</p>
                        <p className="feat_main py-2 my-6 bg-[#009939db] rounded-md  ">Privacy-focused (no central server to store messages or files)</p>
                        <p className="feat_main py-2 my-6 bg-[#ff6600db] rounded-md  ">Simple and intuitive user interface</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
// hover:shadow-[0_0_5px_1px]
// hover:shadow-gray-300
