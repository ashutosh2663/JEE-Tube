import React from "react";
import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import SubjectRow from "../components/home/SubjectRow";

const demoVideos = [
  {
    id: "demo-1",
    title: "Complete Physics Lecture",
    teacher: "JEE Faculty",
    chapter: "Mechanics",
    duration: "1:42:20",
    thumbnail:
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  },
  {
    id: "demo-2",
    title: "Important JEE Concepts",
    teacher: "JEE Faculty",
    chapter: "Physics",
    duration: "58:40",
    thumbnail:
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  },
  {
    id: "demo-3",
    title: "JEE Advanced Problem Solving",
    teacher: "JEE Faculty",
    chapter: "Advanced",
    duration: "1:20:15",
    thumbnail:
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  },
  {
    id: "demo-4",
    title: "Quick Revision",
    teacher: "JEE Faculty",
    chapter: "Revision",
    duration: "42:10",
    thumbnail:
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  },
];

export default function Home() {
  return (
    <Layout>
      <Hero />

      <div className="home-content">
        <SubjectRow
          title="Continue Learning"
          videos={demoVideos}
          viewAllPath="/history"
        />

        <SubjectRow
          title="Physics"
          videos={demoVideos}
          viewAllPath="/subject/physics"
        />

        <SubjectRow
          title="Chemistry"
          videos={demoVideos}
          viewAllPath="/subject/chemistry"
        />

        <SubjectRow
          title="Mathematics"
          videos={demoVideos}
          viewAllPath="/subject/mathematics"
        />
      </div>
    </Layout>
  );
}