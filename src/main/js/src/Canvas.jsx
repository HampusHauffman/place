import React, {useRef,useEffect, useState}  from 'react';
import Draggable from 'react-draggable';
import './App.css';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";



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
    ctx.imageSmoothingEnabled = false;
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


  const [scale, setScale] = useState(1);


  const setCanvasTransformStyle = (s) =>{
    //setCanvasStyle({...canvasStyle, transform: "scale(" + s + "," + s + ")"})
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



  const onCanvasClick = (e, obj) => {
    let x;
    let y;

    var rect = e.target.getBoundingClientRect();
    const clickedPixel = getClickedPixel(e);

    console.log(panStatus.current)
    if(currentScale.current === 40 && panStatus.current < 3){
      placePixel(clickedPixel);
    }
    panStatus.current = 0;


  }


  //Get the clicked pixel
  const getClickedPixel = (evt) => {
    var canvas = canvasRef.current;
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    const cX = evt.clientX ? evt.clientX : evt.changedTouches[0].clientX;
    const cY = evt.clientY ? evt.clientY : evt.changedTouches[0].clientY;
    return {
      x: Math.floor((cX - rect.left) * scaleX),   // scale mouse coordinates after they have
      y: Math.floor((cY - rect.top) * scaleY)   // been adjusted to be relative to element
    }
  }

  const defaultScale = window.innerWidth/1000 < window.innerHeight/1000 ? window.innerWidth/1000*0.8 : window.innerHeight/1000*0.8;

  let currentScale = useRef(1);


  const [dClickSettings,setDClickSettings] = useState({mode:"zoomIn"});

  const panStatus = useRef(1);

    return(
      <>
            <div className={"wrapper"}>
        <TransformWrapper
            defaultScale={defaultScale}
            //defaultPositionX={(window.innerWidth-(1000*defaultScale))/2}
            options={{maxScale:40, minScale:defaultScale, limitToBounds:false, limitToWrapper:false, centerContent:true}}
            doubleClick={dClickSettings}
            onZoomChange={(obj) => {currentScale.current = obj.scale;}}
            onPanning={(obj) => {panStatus.current++}}

            wheel={{step:100}}
        >

          <TransformComponent>
              <canvas
                    ref={canvasRef}
                    className={"canvas"}
                    width={canvasSettings.imageSize}
                    height={canvasSettings.imageSize}
                    onClick={onCanvasClick}
              />
          </TransformComponent>
        </TransformWrapper>
          </div>
      </>

);
}

export default Canvas;