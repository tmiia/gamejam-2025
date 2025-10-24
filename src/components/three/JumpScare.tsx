import Image from "next/image";
import dana from "../../../public/dana.jpg";

const JumpScare = () => {
  return (
    <div
      id="jumpScare"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 30000000,
        opacity: 0,
      }}
    >
      <audio id="audio" src="/jumpscare.mp3"></audio>
      <Image
        id="jumpScareImage"
        src={dana}
        alt="Jump Scare"
        width={1920}
        height={1080}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          opacity: 1,
        }}
      />
    </div>
  );
};

export default JumpScare;
