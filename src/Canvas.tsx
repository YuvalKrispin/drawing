import { useState, useEffect } from "react";
import { IEdge } from "./interface/Drowing.interfaces";



const Canvas = () => {
  const [canvasLines, setCanvasLines] = useState<any>([]);
  const [canvasEdges, setCanvasEdges] = useState<any>([]);
  const [currentDrowingMode, setCurrentDrowingMode] = useState<string>("line");

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
  const offsetCurser = 8; // to get the edge of the curser to be at the edge of the line
  const resetPosition = () => {
    setEndPosition({ x: 0, y: 0 });
    setStartPosition({ x: 0, y: 0 });
  }

  const setEndPosition = ({ x, y, offset = false }: { x: number; y: number, offset?: boolean }) => {
    setX2(x - (offset ? offsetCurser : 0));
    setY2(y - (offset ? offsetCurser : 0));
  };

  const setStartPosition = ({ x, y, offset = false }: { x: number; y: number, offset?: boolean }) => {
    setX1(x - (offset ? offsetCurser : 0));
    setY1(y - (offset ? offsetCurser : 0));
  };

  const addOffsetToMousePosition = (mousePosition: { x: number; y: number }) => {
    return {
      x: mousePosition.x + window.pageXOffset,
      y: mousePosition.y + window.pageYOffset
    }
  }
  const calculateLineLength = ({ x1, x2, y1, y2 }: { x1: number, x2: number, y1: number, y2: number }) => {
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return length;
  };
  useEffect(() => {

    document.addEventListener('mousemove', (e) => {
      setCurrentMousePosition({ x: e.pageX, y: e.pageY });
    })
  }, []);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (e.altKey && closestEdge) {
      setStartPosition({ x: closestEdge.cx, y: closestEdge.cy });
    } else {
      setStartPosition({ x: e.clientX, y: e.clientY, offset: true });
    }
    setEndPosition({ x: e.clientX, y: e.clientY, offset: true });
    setDragging(true);
  };

  const closestLineEdge = () => {
    const pixelDistance = 40;
    const calcDistance = (edge: { cx: number; cy: number; }) => {
      return Math.abs(edge.cx - currentMousePosition.x) + Math.abs(edge.cy - currentMousePosition.y)
    }
    if (canvasEdges.length !== 0) {
      const closest = canvasEdges.reduce((prev: { cx: number; cy: number; }, curr: { cx: number; cy: number; }) => {
        if (calcDistance(curr) > pixelDistance) {
          return prev
        }
        return (calcDistance(curr) < calcDistance(prev) ? curr : prev);
      });
      if (calcDistance(closest) > pixelDistance) return null
      return closest;
    } else {
      return null;
    }
  }
  const highlightLineEdge = (index: number) => {
    if (index === null) return
    setCanvasEdges(canvasEdges.map((edge: any, i: number) => {
      if (i === index) {
        return { ...edge, isHighlighted: true };
      } else {
        return { ...edge, isHighlighted: false };
      }
    }));
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const closestEdgeT = closestLineEdge()
    setClosestEdge(closestEdgeT)
    highlightLineEdge(closestEdgeT?.index);

    if (dragging) {
      if (e.ctrlKey) setStrokeDasharray("10,5");
      else { setStrokeDasharray(""); }
      if (e.shiftKey) {
        setStickyShift()
      } else
        if (e.altKey && closestEdge) {
          setEndPosition({ x: closestEdge.cx, y: closestEdge.cy });
        }
        else {
          setEndPosition({ x: e.clientX, y: e.clientY, offset: true });
        }
    }

  };
  const draw = () => {
    setCanvasLines([...canvasLines, { index: canvasLines.length, x1, y1, x2, y2, stroke, strokeWidth, strokeDasharray, strokeDashoffset, strokeLinecap, strokeLinejoin, strokeMiterlimit, strokeOpacity }]);
    setCanvasEdges([...canvasEdges, { index: canvasEdges.length, lineIndex: canvasLines.length, cx: x1, cy: y1 }, { index: canvasEdges.length + 1, lineIndex: canvasEdges.length, cx: x2, cy: y2 }]);
  }
  const handleMouseUp = () => {
    if (calculateLineLength({ x1, x2, y1, y2 }) > 50)
      draw();
    resetPosition();
    setDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (dragging) {
      if (e.key === "Control") {
        setStrokeDasharray("10,5");
      }
      if (e.key === "Shift") {
        setStickyShift();
      }
      if (e.key === "Alt" && closestEdge) {
        setEndPosition({ x: closestEdge.cx, y: closestEdge.cy });
      }
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (dragging) {
      if (e.key === "Control") {
        setStrokeDasharray("");
      }
      if (e.key === "Shift") {
        setEndPosition({ x: currentMousePosition.x, y: currentMousePosition.y, offset: true });
      }
    }
  }
  const setStickyShift = () => {
    if (Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
      setEndPosition({ x: x1, y: currentMousePosition.y })
    }
    else {
      setEndPosition({ x: currentMousePosition.x, y: y1 })
    }
  }

  const resetCanvase = () => {
    setCanvasLines([]);
    setCanvasEdges([]);
  }

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

  return (
    <>
      <svg
        width="100vw"
        height="80vh"
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
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
        {canvasLines.map((line: any, index: number) =>
          <line key={index}
            strokeLinecap={line.strokeLinecap}
            strokeLinejoin={line.strokeLinejoin}
            strokeMiterlimit={line.strokeMiterlimit}
            stroke={line.stroke}
            strokeWidth={line.strokeWidth}
            strokeDasharray={line.strokeDasharray}
            strokeDashoffset={line.strokeDashoffset}
            strokeOpacity={line.strokeOpacity}
            x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
        )}
        {canvasEdges.map((edge: any, index: number) => <circle key={index} cy={edge.cy} cx={edge.cx} r={edge.isHighlighted ? 3 : 0} />)}
      </svg>
      x-start = {x1} x-end = {x2} y-start = {y1} y-end = {y2} <button onClick={resetCanvase}>reset canvas</button>
    </>
  );
};

export default Canvas;


