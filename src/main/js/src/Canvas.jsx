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

    x = e.target.clientWidth/2 - ((rect.width/(1000*scale)) * getClickedPixel(e).x)
    y = e.target.clientHeight/2 - ((rect.height/(1000*scale)) * getClickedPixel(e).y)


    if(scale===1) {
      setScale(8);
      setCanvasTransformStyle(8)
    }else if(scale===8){
      setScale(40);
      setCanvasTransformStyle(40)
    }else if(scale===40 && selectedColor === -1){
      setScale(1);
      setCanvasTransformStyle(1)
    }else {
      const p = getClickedPixel(e);
      placePixel(p);
    }

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


    return(
      <>
            <div className={"wrapper"}>
        <TransformWrapper
            defaultScale={window.innerWidth/1000 < window.innerHeight/1000 ? window.innerWidth/1000*0.8 : window.innerHeight/1000*0.8}
            options={{maxScale:40, minScale:0.5, limitToBounds:false, centerContent:false}}
            zoomIn={{step:200}}
            doubleClick={{step:200, mode:"zoomIn"}}
            wheel={{step:100}}
        >

          <TransformComponent>
            <div style={{width:"100vw", height:"100vh"}}>
              <canvas
                    ref={canvasRef}
                    className={"canvas"}
                    width={canvasSettings.imageSize}
                    height={canvasSettings.imageSize}
                    onClick={onCanvasClick}
              />
            </div>
          </TransformComponent>
        </TransformWrapper>
          </div>
      </>

);
}

export default Canvas;