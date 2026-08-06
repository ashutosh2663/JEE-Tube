import { motion } from "framer-motion";

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "60px",
        borderRadius: "20px",
        background:
          "linear-gradient(135deg, #111111 0%, #1a1a1a 45%, #2b0d0d 100%)",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "650px" }}>
        <p
          style={{
            color: "#E50914",
            fontWeight: "700",
            letterSpacing: "3px",
            marginBottom: "20px",
          }}
        >
          PREMIUM JEE LEARNING PLATFORM
        </p>

        <h1
          style={{
            fontSize: "72px",
            fontWeight: "900",
            lineHeight: "1.1",
            marginBottom: "25px",
          }}
        >
          JEE Tube
        </h1>

        <p
          style={{
            color: "#bdbdbd",
            fontSize: "22px",
            lineHeight: "1.7",
            marginBottom: "40px",
          }}
        >
          Learn Physics, Chemistry and Mathematics with the best lectures,
          organized in one distraction-free experience.
        </p>

        <div style={{ display: "flex", gap: "20px" }}>
          <button
            style={{
              background: "#E50914",
              color: "white",
              border: "none",
              padding: "16px 34px",
              borderRadius: "12px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ▶ Start Learning
          </button>

          <button
            style={{
              background: "transparent",
              color: "white",
              border: "1px solid #444",
              padding: "16px 34px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            Browse Subjects
          </button>
        </div>
      </div>

      <div
        style={{
          width: "340px",
          height: "340px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle,#E50914 0%,#7d0b10 55%,transparent 75%)",
          filter: "blur(8px)",
        }}
      />
    </motion.section>
  );
}