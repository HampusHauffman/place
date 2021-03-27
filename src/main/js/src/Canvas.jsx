import React, {useRef,useEffect, useState}  from 'react';
import Draggable from 'react-draggable';
import './App.css';


const Canvas = ({client, canvasSettings, selectedColor, pixel, setSwatchSettings, swatchSettings}) => {

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

  const transformCanvas = (s, x, y) =>{

    if(s===8){
      setCanvasTransformStyle(s,x,y);
    }else if(s===40) {
      setSwatchSettings((s) => ({...s, show: true}));
      setCanvasTransformStyle(s,x,y);
    }else {
      s = 1;
      setSwatchSettings((s) => ({...s, show:false}));
      setCanvasTransformStyle(s,0,0);
    }
  }

  const setCanvasTransformStyle = (s, x, y) =>{
    setCanvasStyle({...canvasStyle, transform: "scale(" + s + "," + s + ") " +  "translate("+x+","+y+")"})
  }

  const placePixel = (p) => {
    if(selectedColor === -1){
      return;
    }
    client.publish({
      destination:"/pixel",
      body: JSON.stringify({"x":p.x, "y":p.y, "color":selectedColor})
    })
  }

  const onCanvasClick = (obj) => {
    const x = obj.target.clientWidth/2 - obj.nativeEvent.offsetX + "px"
    const y = obj.target.clientHeight/2 - obj.nativeEvent.offsetY + "px"

    if(scale===1) {
      setScale(8);
      transformCanvas(8,x, y)
    }else if(scale===8){
      setScale(40);
      transformCanvas(40,x, y)
    }else if(scale===40 && selectedColor === -1){
      setScale(1);
      transformCanvas(1,x, y)
    }else {
      const p = getClickedPixel(obj);
      placePixel(p);
    }

  }

  useEffect((s) => {
    console.log(swatchSettings);
  },[swatchSettings])


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
        <canvas ref={canvasRef}
              style={canvasStyle}
              onClick={onCanvasClick}
              className={"canvas"}
              width={canvasSettings.imageSize}
              height={canvasSettings.imageSize}
        />
  );
}

export default Canvas;