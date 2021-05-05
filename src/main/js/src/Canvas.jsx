import React, {useEffect, useRef} from 'react';
import './App.css';
import {TransformComponent, TransformWrapper} from "react-zoom-pan-pinch";

const Canvas = ({client, canvasSettings, selectedColor, pixel}) => {

  const swatchColors = [
    '#FFFFFF',
    '#E4E4E4',
    '#888888',
    '#222222',
    '#FFA7D1',
    '#E50000',
    '#E59500',
    '#A06A42',
    '#E5D900',
    '#94E044',
    '#02BE01',
    '#00D3DD',
    '#0083C7',
    '#0000EA',
    '#CF6EE4',
    '#820080',];

  //Reference to the mutable canvas context value
  const canvasRef = useRef(null);

  useEffect(() => {
    //Create imageData
    const imageData = new ImageData(
        new Uint8ClampedArray(canvasSettings.pixels.flat()),
        canvasSettings.imageSize, canvasSettings.imageSize);
    //Display imageData
    //Get context for canvas
    const canvasObj = canvasRef.current;
    const ctx = canvasObj.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.putImageData(imageData, 0, 0);
  }, [canvasSettings])

  useEffect(() => {
    if (pixel) {
      const imageData = new ImageData(
          new Uint8ClampedArray(
              [pixel.color.r, pixel.color.g, pixel.color.b, 255]), 1, 1);
      const canvasObj = canvasRef.current;
      const ctx = canvasObj.getContext("2d");
      ctx.putImageData(imageData, pixel.x, pixel.y);
    }
  }, [pixel])

  const placePixel = (p) => {
    if (selectedColor === -1) {
      return;
    }
    client.publish({
      destination: "/pixel",
      body: JSON.stringify({"x": p.x, "y": p.y, "color": selectedColor})
    })
  }

  const onCanvasClick = (e, obj) => {
    const clickedPixel = getClickedPixel(e);

    if (currentScale.current === 40 && panStatus.current < 3) {
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

  const defaultScale = window.innerWidth / 1000 < window.innerHeight / 1000
      ? window.innerWidth / 1000 * 0.8 : window.innerHeight / 1000 * 0.8;

  let currentScale = useRef(1);

  const zoomChange = (obj) => {
    currentScale.current = obj.scale;
  }

  const panStatus = useRef(1);

  return (
      <>
        <div className={"wrapper"}>
          <TransformWrapper
              defaultScale={defaultScale}
              defaultPositionX={(window.innerWidth - (1000 * defaultScale)) / 2}
              defaultPositionY={0}
              options={{
                maxScale: 40,
                minScale: defaultScale*0.9,
                limitToBounds: false,
                limitToWrapper: false,
                centerContent: false
              }}
              doubleClick={{mode: "zoomIn", step: 100}}
              onZoomChange={zoomChange}
              onPanning={(obj) => {
                panStatus.current++
              }}
              wheel={{step: 100}}
          >
            {({setTransform, resetTransform, setScale}) => (
                <>
                  <TransformComponent>
                    <canvas
                        ref={canvasRef}
                        className={"canvas"}
                        width={canvasSettings.imageSize}
                        height={canvasSettings.imageSize}
                        onClick={onCanvasClick}
                    />
                  </TransformComponent>


                  <button onClick={() => {
                    setTransform(
                        (window.innerWidth - (1000 * defaultScale)) / 2,
                        0,
                        defaultScale,
                        200,
                        "easeOut")
                  }}
                    className={"extraButton resetButton"}
                    style={{backgroundColor: swatchColors[selectedColor]}}
                  >
                    <img src={"/reset.png"} alt={"reset"} style={{width:40, marginLeft:-5, marginTop:1, transform:"scaleX(-1)"}}/>
                  </button>
                </>
            )}
          </TransformWrapper>
        </div>
      </>

  );
}

export default Canvas;