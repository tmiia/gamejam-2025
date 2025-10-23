"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import fog from "../../../public/fog.png";
import imageLoading from "../../../public/loaded2.png";
import tombe from "../../../public/tombe.png";
import Experience from "../Experience/Experience";

declare global {
  interface Window {
    experience: Experience | undefined;
  }
}

const ThreeJSExperience = () => {
  const canvasRef = useRef(null);
  const router = useRouter();

  console.log(tombe, fog);

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

      {/* Tutoriel */}
      <div
        id="tutorial"
        style={{
          height: "100vh",
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 98,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          alignItems: "flex-start",
          justifyContent: "center",
          color: "black",
          fontSize: "14px",
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              paddingTop: "0.5rem",
            }}
          >
            <Image
              src={imageLoading}
              alt="Loading..."
              width={500}
              height={500}
              style={{
                height: "auto",
                width: "2rem",
                aspectRatio: "1 / 1",
                objectFit: "cover",
                backgroundColor: "red",
              }}
            />
            <p>Marcher</p>
          </div>
        ))}
      </div>

      {/* Score */}
      <div
        id="score"
        style={{
          height: "100vh",
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 150,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          alignItems: "start",
          justifyContent: "end",
          color: "black",
          fontSize: "20px",
        }}
      >
        <p id="scoreNumber">300000</p>
      </div>

      {/* Game Over */}
      <div
        className="absolute top-0 left-0 h-screen w-screen z-[101] bg-[#0E0E0E] pointer-events-none opacity-0"
        id="gameOver"
      >
        <Image
          src={fog}
          id="fogGameOver"
          alt="Game Over"
          style={{
            position: "absolute",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "50%",
            objectFit: "cover",
            animation: "fog 3s ease-in-out infinite",
          }}
        />
        <Image
          src={tombe}
          id="tombeGameOver"
          alt="Game Over"
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
      <div
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
      ></div>

      {/* Niveau de sang */}
      <div
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
      </div>

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
