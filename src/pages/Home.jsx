import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import SubjectRow from "../components/home/SubjectRow";

export default function Home() {
  return (
    <Layout>
      <Hero />
      <SubjectRow />
    </Layout>
  );
}