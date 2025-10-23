"use client";
import { useCallback, useEffect, useRef } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import imageLoading from "../../../public/loaded2.png";
import Experience from "../Experience/Experience";

declare global {
  interface Window {
    experience: Experience | undefined;
  }
}

const ThreeJSExperience = () => {
  console.log(imageLoading);

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
      <div
        id="isLoaded"
        className="h-screen w-screen absolute top-0 left-0 bg-white z-[100] flex flex-col gap-4 items-center justify-center"
      >
        <Image
          src={imageLoading}
          alt="Loading..."
          width={500}
          height={500}
          className="h-auto w-[28vw] "
        />
        <div className="h-4 w-[28vw] bg-[#D9D9D9] flex items-center">
          <div
            id="loadingBar"
            className="h-full bg-black w-0 duration-200 ease-in-out"
          ></div>
        </div>
      </div>
      <div
        id="gameOver"
        className="h-screen w-screen absolute top-0 left-0 z-[101] pointer-events-none opacity-0  "
        style={{
          background:
            "radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 0%)",
        }}
      ></div>
      <div
        id="bloodLevel"
        className="h-5 w-64 absolute top-5 left-5 bg-red-200 z-[99]"
      >
        <span
          id="bloodLevelSpan"
          className="block h-full w-full bg-red-600"
          style={{ width: "100%" }}
        ></span>
      </div>
      <div
        id="scrollContainer"
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      >
        <canvas ref={canvasRef} className="sticky top-0 left-0" />
      </div>
    </>
  );
};

export default ThreeJSExperience;
