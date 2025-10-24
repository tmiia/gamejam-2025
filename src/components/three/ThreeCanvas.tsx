"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import fall from "../../../public/fall.png";
import imageLoading from "../../../public/level6.png";
import Experience from "../Experience/Experience";

import BloodBar from "./header/BloodBar";
import Score from "./header/Score";
import Tutorial from "./header/Tutorial";
import JumpScare from "./JumpScare";

declare global {
  interface Window {
    experience: Experience | undefined;
  }
}

const ThreeJSExperience = () => {
  const canvasRef = useRef(null);
  const router = useRouter();

  const routerReplace = useCallback(
    (path: string) => {
      router.replace(path);
    },
    [router]
  );

  useEffect(() => {
    if (window.experience) {
      Experience.resetInstance();
    }

    let experience = null;

    if (canvasRef.current) {
      try {
        experience = new Experience(canvasRef.current, routerReplace);
      } catch (error) {
        console.error("Erreur lors de l'initialisation de Three.js:", error);
      }
    }

    return () => {
      if (experience) {
        experience.destroy();
      }
    };
  }, [routerReplace]);

  return (
    <>
      {/* Écran de chargement */}
      <div
        id="isLoaded"
        style={{
          height: "100vh",
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor: "white",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src={imageLoading}
          alt="Loading..."
          width={500}
          height={500}
          style={{
            height: "auto",
            width: "28vw",
          }}
        />
        <div
          style={{
            height: "1rem",
            width: "28vw",
            backgroundColor: "#D9D9D9",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            id="loadingBar"
            style={{
              height: "100%",
              backgroundColor: "black",
              width: "0%",
              transitionDuration: "200ms",
              transitionTimingFunction: "ease-in-out",
            }}
          ></div>
        </div>
      </div>

      <p
        id="instructions"
        className="absolute top-1/5 left-1/2 -translate-x-1/2 z-[10000] text-black opacity-0 text-[30px]"
      >
        retrouve ta tête avant qu’il ne soit trop tard.
        <span className="h-full w-[100%] block bg-[#F2F3F5] absolute top-0 right-0 origin-right"></span>
      </p>

      <header
        style={{
          height: "auto",
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 99,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
          color: "black",
          fontSize: "20px",
          padding: ".5rem 1.25rem",
        }}
      >
        <BloodBar />
        <Tutorial />
        <Score />
      </header>

      {/* Game Over */}
      <div
        className="absolute top-0 left-0 h-screen w-screen z-[101] bg-[#0E0E0E] pointer-events-none opacity-0"
        id="gameOver"
      >
        <video
          id="deadVideo"
          src="/dead.mp4"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100vw",
            height: "100vh",
            zIndex: 200,
            objectFit: "cover",
            opacity: 0,
          }}
          muted
        ></video>
        <video
          id="deadVideo2"
          src="/dead.mp4"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100vw",
            height: "100vh",
            zIndex: 200,
            objectFit: "cover",
            opacity: 0,
          }}
          muted
        ></video>
        <Image
          src={fall}
          id="fallGameOver"
          alt="fall"
          style={{
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translate(-50%, 10%)",
            width: "50%",
            objectFit: "cover",
            opacity: 0,
          }}
        />
      </div>
      <JumpScare />
      <video
        id="endVideo"
        src="/outro.mp4"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100vw",
          height: "100vh",
          zIndex: 200,
          objectFit: "cover",
          opacity: 0,
        }}
        muted
      ></video>

      {/* <div
        id="gameOver"
        style={{
          height: "100vh",
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 101,
          pointerEvents: "none",
          opacity: 0,
          background:
            "radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 0%)",
        }}
      ></div> */}

      {/* Niveau de sang */}
      {/* <div
        // id="bloodLevel"
        style={{
          height: "1.25rem",
          width: "16rem",
          position: "absolute",
          top: "1.25rem",
          left: "1.25rem",
          backgroundColor: "#fecaca", // équivalent bg-red-200
          zIndex: 99,
        }}
      >
        <span
          id="bloodLevelSpan"
          style={{
            display: "block",
            height: "100%",
            width: "100%",
            backgroundColor: "#dc2626", // équivalent bg-red-600
          }}
        ></span>
      </div> */}

      {/* Canvas */}
      <div
        id="scrollContainer"
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "sticky",
            top: 0,
            left: 0,
          }}
        />
      </div>
    </>
  );
};

export default ThreeJSExperience;
