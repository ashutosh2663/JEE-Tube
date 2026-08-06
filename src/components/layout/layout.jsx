import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        background: "#0B0B0B",
      }}
    >
      <Sidebar />

      <main
        style={{
          marginLeft: "260px",
          width: "100%",
          minHeight: "100vh",
          padding: "25px 35px",
        }}
      >
        <Navbar />

        {children}
      </main>
    </div>
  );
}