import { Bell, Search, UserCircle2 } from "lucide-react";

export default function Navbar() {
  return (
    <div
      style={{
        height: 70,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 25,
        marginBottom: 30,
      }}
    >
      <Search />
      <Bell />
      <UserCircle2 size={30} />
    </div>
  );
}