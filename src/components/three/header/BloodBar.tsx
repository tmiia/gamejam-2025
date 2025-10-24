const BloodBar = () => {
  return (
    <div
      // id="bloodLevel"
      style={{
        height: ".25rem",
        width: "16rem",
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
  );
};

export default BloodBar;
