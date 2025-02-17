import { LoadingOutlined } from "@ant-design/icons";

export function BtnLoader({ color = 'text-white' }) { 
  return <LoadingOutlined spin delay={500} className={color} />; 
}

export function Loader({ className }) {
  return (
    <LoadingOutlined
      spin
      delay={500}
      className={`${className} text-purple-600`}
    />
  );
}