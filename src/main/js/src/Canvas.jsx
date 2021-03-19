import React, {useRef,useEffect, useState}  from 'react';
import * as SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';
import './App.css';
import {SwatchesPicker} from "react-color";
import {Github} from "react-color/lib/components/github/Github";

const Canvas = ({client, canvasSettings, selectedColor}) => {

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

  const onCanvasClick = (obj) => {
    const pixels = getClickedPixel(obj);
    client.publish({
      destination:"/pixel",
      body: JSON.stringify({"x":pixels.x, "y":pixels.y, "color":selectedColor})
      })
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
      <canvas ref={canvasRef}  onClick={onCanvasClick} className={"canvas"} width={canvasSettings.imageSize} height={canvasSettings.imageSize}/>
  );
}

export default Canvas;