import React, {useRef,useEffect, useState}  from 'react';
import * as SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';
import './App.css';
import {SwatchesPicker} from "react-color";
import {Github} from "react-color/lib/components/github/Github";


const App = () => {

  //Canvas
  const [canvasSettings, setCanvasSettings] = useState({
    "height": 5,
    "width": 5,
    "pixels":[
      [245,245,245,255],[245,245,245,255],[245,245,245,255],[245,245,245,255],[245,245,245,255],
      [235,235,235,255],[235,235,235,255],[235,235,235,255],[235,235,235,255],[235,235,235,255],
      [225,225,225,255],[225,225,225,255],[225,225,225,255],[225,225,225,255],[225,225,225,255],
      [215,215,215,255],[215,215,215,255],[215,215,215,255],[215,215,215,255],[215,215,215,255],
      [205,205,205,255],[205,205,205,255],[205,205,205,255],[205,205,205,255],[205,205,205,255],
    ]
  })

  //Reference to the mutable canvas context value
  const canvasRef = useRef(null);

  const [client, setClient] = useState(new Client({
    brokerURL: 'ws://localhost:8080/ws',
    debug: function (str) {
      console.log(str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  }));

  //STOMP
  const callback = (message) => {
    if (message.body) {
      //messagePixelArray
      var mpa = JSON.parse('[' + message.body + ']')[0];
      var newCanvas = {...canvasSettings};
      mpa.map((m) => {
      newCanvas.pixels[m.x+m.y*canvasSettings.height] = [hexToRgb(swatchColors[m.color]).r,hexToRgb(swatchColors[m.color]).g,hexToRgb(swatchColors[m.color]).b,255]; //todo
      })
      setCanvasSettings(newCanvas);
    } else {
      console.log("got empty message");
    }
  };

  client.onConnect = (frame) => {
    client.subscribe("/topic/place", callback);
    console.log("Connected: " + frame);
  }

  client.onStompError =  (frame) => {
    console.log('Broker reported error: ' + frame.headers['message']);
    console.log('Additional details: ' + frame.body);
  };


  useEffect(() => {
    client.activate();

  },[]);


  useEffect(() => {

    //Create imageData
    const imageData = new ImageData(new Uint8ClampedArray(canvasSettings.pixels.flat()),canvasSettings.width,canvasSettings.height);

    //Display imageData
    //Get context for canvas
    const canvasObj = canvasRef.current;
    const ctx = canvasObj.getContext("2d");
    ctx.putImageData(imageData,0,0);
  },[canvasSettings])

  const onCanvasClick = (obj) => {
    const pixels = getClickedPixel(obj);
    client.publish({
      destination:"/pixel", //app/pixel if prefix...
      body: JSON.stringify({"x":pixels.x, "y":pixels.y, "color":selectedColor})})
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

  const [selectedColor, setSelectedColor] = useState('#FFFFFF')
  const swatchOnClick = (obj) =>{
    setSelectedColor(swatchColors.indexOf(obj.hex));
  }

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

  const hexToRgb = (hex) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  return (
    <>
      <canvas ref={canvasRef}  onClick={onCanvasClick} className={"canvas"} width={canvasSettings.width} height={canvasSettings.height}/>
      <Github onChange={swatchOnClick} colors={swatchColors} className={"swatch"} height={"100"} />
    </>
  );
}

export default App;
