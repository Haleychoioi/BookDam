//차트

const TasteAnalysisPage: React.FC = () => {
  return (
  <div>
    <section id="chart" className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-5">이런 책, 좋아하시네요!</h1>
      <p className="text-lg mb-40">
        지금까지의 서재 활동을 바탕으로 나만의 독서 취향을 분석했어요 <br />
        어떤 책을 좋아하는지, 어떤 키워드에 끌리는지 함께 확인해보세요!
      </p>
      <h1 className="text-4xl font-bold mb-5">님의 취향분석</h1>
    </section>
    <section id="chart" className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-5">책 선호태그</h1>
      <p className="text-lg mb-40">
        독서 기록을 바탕으로 분석한 당신만의 선호 키워드예요. <br />
        무엇에 마음이 움직였는지, 어떤 주제에 이끌렸는지 확인해보세요.
      </p>
    </section>
  </div>
  )
};

export default TasteAnalysisPage;
