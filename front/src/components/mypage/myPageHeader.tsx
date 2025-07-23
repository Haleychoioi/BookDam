import React from "react";

interface MyPageHeaderProps {
  title: string;
  description: string;
}

const MyPageHeader: React.FC<MyPageHeaderProps> = ({ title, description }) => {
  return (
    <div className="my-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-600 text-md">{description}</p>
    </div>
  );
};

export default MyPageHeader;
