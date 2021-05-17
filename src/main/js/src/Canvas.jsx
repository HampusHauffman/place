import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {TransformComponent, TransformWrapper} from "react-zoom-pan-pinch";
import Modal from "react-modal";

const Canvas = ({client, canvasSettings, selectedColor, pixel}) => {


  const dpi = window.devicePixelRatio;
  const dpiScale = dpi !== 1 ? 5000 : 1000;
  const maxScale = 40 * 1000 / dpiScale;

  const swatchColors = [ //TODO change this if you reset the board
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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d",{ alpha: false });
    ctx.shadowBlur = 0;
    ctx.mozImageSmoothingEnabled = false;  // firefox
    ctx.imageSmoothingEnabled = false;


    ctx.putImageData(imageData, 0, 0);

  }, [canvasSettings])

  useEffect(() => {
    if (pixel) {
      const imageData = new ImageData(
          new Uint8ClampedArray(
              [pixel.color.r, pixel.color.g, pixel.color.b, 255]), 1,1);

      //Get context for canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d",{ alpha: false });
      ctx.shadowBlur = 0;
      ctx.mozImageSmoothingEnabled = false;  // firefox
      ctx.imageSmoothingEnabled = false;


      ctx.putImageData(imageData, pixel.x, pixel.y);
    }
  }, [pixel])

  const placePixel = (p) => {
    client.publish({
      destination: "/pixel",
      body: JSON.stringify({"x": p.x, "y": p.y, "color": selectedColor})
    })
  }

  const onCanvasClick = (e, obj) => {
    const clickedPixel = getClickedPixel(e);


    if (panStatus.current < 3 && currentScale.current > 3*canvasSettings.imageSize/dpiScale) {
      console.log(3*1000/dpiScale)
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

  const defaultScale = window.innerWidth / dpiScale < window.innerHeight / dpiScale
      ? window.innerWidth / dpiScale * 0.8 : window.innerHeight / dpiScale * 0.8;

  const currentScale = useRef(1);

  const panStatus = useRef(1);

  const [modalOpen, setModalOpen] = useState(true);

  const customModalStyles = {
    overlay: {
      backgroundColor: swatchColors[selectedColor] + '30',
    },
    content: {
      top: '30%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-35%',
      transform: 'translate(-50%, -30%)',
      background: "#121212",
      color: "#FAFAFA",
      border: '3px solid ' + swatchColors[selectedColor],
      borderRadius: '25px',
    }
  };

  Modal.setAppElement('#root')

  return (
      <>
        <div className={"wrapper"}>
          <TransformWrapper
              defaultScale={defaultScale}
              defaultPositionX={(window.innerWidth - (dpiScale * defaultScale)) / 2}
              defaultPositionY={0}
              options={{
                maxScale: maxScale,
                minScale: defaultScale * 0.9,
                limitToBounds: false,
                limitToWrapper: false,
                centerContent: false
              }}
              onZoomChange={(obj) => {
                currentScale.current = obj.scale
              }}
              doubleClick={{mode: "zoomIn", step: 100}}
              onPanning={(obj) => {
                panStatus.current++
              }}
              wheel={{step: 100}}
          >
            {({setTransform, resetTransform, setScale, scale}) => (
                <>
                  <TransformComponent>
                    <canvas
                        ref={canvasRef}
                        className={"canvas"}
                        width={canvasSettings.imageSize}
                        height={canvasSettings.imageSize}
                        onClick={onCanvasClick}
                        style={{height:dpiScale, width:dpiScale} }
                    />
                  </TransformComponent>

                  <button onClick={() => {
                    setTransform(
                        (window.innerWidth - (dpiScale * defaultScale)) / 2,
                        0,
                        defaultScale,
                        200,
                        "easeOut")
                  }}
                          className={"extraButton resetButton"}
                          style={{backgroundColor: swatchColors[selectedColor]}}
                  >
                    <img src={"/reset.png"} alt={"reset"} style={{
                      width: 30,
                      marginLeft: -1,
                      marginTop: 1,
                      transform: "scaleX(-1)"
                    }}/>
                  </button>
                  <p className={"scale"}>{(scale).toFixed(2)}x</p>

                  <Modal
                      isOpen={modalOpen}
                      onRequestClose={() => {
                        setModalOpen(false)
                      }}
                      onAfterClose={() => {
                        setTransform(
                            Math.random() * (-40000 + window.innerWidth),
                            Math.random() * (-40000 + window.innerHeight),
                            maxScale,
                            4000,
                            "easeOut")
                      }}
                      style={customModalStyles}
                      contentLabel="Example Modal"
                  >

                    <button className={"extraButton"} onClick={() => {
                      setModalOpen(false)
                    }}
                            style={{
                              backgroundColor: swatchColors[selectedColor],
                              right: 10,
                              top: 10
                            }}>
                      <span style={{marginTop:-2}}>x</span>
                    </button>
                    <br/>
                    <h2 style={{marginTop: -10}}>This is PXL.PLACE</h2>
                    <h3>Try moving and zooming around and place some PIXELS</h3>
                    <p>PXL.PLACE is a live canvas for people to create art
                      together across the world!</p>
                  </Modal>
                </>
            )}
          </TransformWrapper>
        </div>
      </>

  );
}

export default Canvas;