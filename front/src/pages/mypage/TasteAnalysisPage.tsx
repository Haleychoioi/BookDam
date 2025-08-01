
import MyPageHeader from "../../components/mypage/MyPageHeader"




const TasteAnalysisPage: React.FC = () => {

  return (
    <div>
    <section className="container mx-auto py-12 px-4">
      <MyPageHeader
        title="독서 취향 분석"
        description="지금까지의 서재 활동을 바탕으로 나만의 독서 취향을 확인할 수 있습니다."
      />
    </section>
  </div>
  )
};

export default TasteAnalysisPage;
