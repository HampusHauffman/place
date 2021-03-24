import React, {useRef,useEffect, useState}  from 'react';
import Draggable from 'react-draggable';
import './App.css';


const Canvas = ({client, canvasSettings, selectedColor, pixel}) => {

  //Reference to the mutable canvas context value
  const canvasRef = useRef(null);

  useEffect(() => {
    //Create imageData
    const imageData = new ImageData(new Uint8ClampedArray(canvasSettings.pixels.flat()),canvasSettings.imageSize,canvasSettings.imageSize);
    //Display imageData
    //Get context for canvas
    const canvasObj = canvasRef.current;
    const ctx = canvasObj.getContext("2d");
    ctx.putImageData(imageData,0,0);
  },[canvasSettings])

  useEffect(() => {
    if(pixel) {
      const imageData = new ImageData(
          new Uint8ClampedArray([pixel.color.r, pixel.color.g, pixel.color.b, 255]), 1, 1);
      const canvasObj = canvasRef.current;
      const ctx = canvasObj.getContext("2d");
      ctx.putImageData(imageData, pixel.x, pixel.y);
    }
  },[pixel])

  const [canvasStyle, setCanvasStyle] = useState();
  const [scale, setScale] = useState(1);

  const onCanvasClick = (obj) => {
    const pixels = getClickedPixel(obj);



    client.publish({
      destination:"/pixel",
      body: JSON.stringify({"x":pixels.x, "y":pixels.y, "color":selectedColor})
      })
  }

  const onWrapperClick = (obj) => {

    const s = scale===1 ? 40 : 1;
    setScale(scale===1 ? 40 : 1);

    setCanvasStyle({...canvasStyle, transform: "scale(" + s + "," + s + ")",
      transformOrigin: obj.clientX + "px " + obj.clientY + "px"})
  }

  //Get the clicked pixel
  const getClickedPixel = (evt) => {
    var canvas = canvasRef.current;
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    return {
      x: Math.floor((evt.clientX - rect.left) * scaleX),   // scale mouse coordinates after they have
      y: Math.floor((evt.clientY - rect.top) * scaleY)   // been adjusted to be relative to element
    }
  }


  return(
      <div style={canvasStyle} className={"dragWrapper"} onClick={onWrapperClick}>
      <Draggable scale={scale}>
        <canvas ref={canvasRef}
              onClick={onCanvasClick}
              className={"canvas"}
              width={canvasSettings.imageSize}
              height={canvasSettings.imageSize}
        />
      </Draggable>
      </div>
  );
}

export default Canvas;