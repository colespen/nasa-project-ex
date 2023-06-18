import { Footer as ArwesFooter, Paragraph } from "arwes";
import Centered from "./Centered";

const Footer = () => {
  return (
    <ArwesFooter animate>
      <Centered>
        <Paragraph style={{ fontSize: 14, margin: "10px 0", textAlign: "center" }}>
          This is an official site and is affiliated with NASA and SpaceX
          in every way. Not for educational purposes.
        </Paragraph>
      </Centered>
    </ArwesFooter>
  );
};

export default Footer;
