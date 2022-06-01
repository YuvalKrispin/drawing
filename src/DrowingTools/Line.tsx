import { useState } from "react";
import { IEdge } from "../interface/Drowing.interfaces";

const Line = () => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [currentMousePosition, setCurrentMousePosition] = useState({ x: 0, y: 0 });

  const [x1, setX1] = useState(0);
  const [y1, setY1] = useState(0);
  const [x2, setX2] = useState(0);
  const [y2, setY2] = useState(0);

  const [closestEdge, setClosestEdge] = useState<IEdge | null>();

  const [stroke, setStroke] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [strokeDasharray, setStrokeDasharray] = useState("");
  const [strokeDashoffset, setStrokeDashoffset] = useState(0);
  const [strokeLinecap, setStrokeLinecap] = useState<"butt" | "round" | "square" | "inherit" | undefined>("round");
  const [strokeLinejoin, setStrokeLinejoin] = useState<"round" | "inherit" | "miter" | "bevel" | undefined>("miter");
  const [strokeMiterlimit, setStrokeMiterlimit] = useState(4);
  const [strokeOpacity, setStrokeOpacity] = useState(1);

  const handleTextPositionInVector = (): string => {
    const deg = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    let rotate = 0
    if (deg < 90 && deg > -90) {
      rotate = deg
    } else {
      rotate = deg - 180
    }
    return `translate(${(x1 + x2) / 2}px,${(y1 + y2) / 2}px) rotate(${rotate}deg)`;
  }
  const calculateLineLength = ({ x1, x2, y1, y2 }: { x1: number, x2: number, y1: number, y2: number }): number => {
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return length;
  };

  return (<>
    <text
      textAnchor="middle"
      style={{
        userSelect: 'none',
        transform: handleTextPositionInVector()
      }}>{calculateLineLength({ x1, x2, y1, y2 }).toFixed(0)}</text>
    <line
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeMiterlimit={strokeMiterlimit}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      strokeOpacity={strokeOpacity}
      x1={x1} y1={y1} x2={x2} y2={y2} />
  </>)
}

export default Line;