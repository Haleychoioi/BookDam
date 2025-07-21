import HomeHeroSection from "../components/home/HomeHeroSection";
import RecruitingCommunityList from "../components/home/RecruitingCommunityList";

const HomePage: React.FC = () => {
  return (
    <div className="home-page-content">
      <HomeHeroSection />
      <RecruitingCommunityList />
    </div>
  );
};

export default HomePage;
