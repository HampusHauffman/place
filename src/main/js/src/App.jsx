import React, {useRef,useEffect, useState}  from 'react';
import * as SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';
import './App.css';


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
    logRawCommunication: true,
  }));

  //STOMP
  const callback = (message) => {
    if (message.body) {
      console.log(message.body)
      //messagePixelArray
      var mpa = JSON.parse("[" + message.body + "]");

      var newPixels = [...canvasSettings.pixels];
      newPixels[6] = [mpa[0][0]*17,mpa[0][1]*17,mpa[0][2]*17,255];
      setCanvasSettings({...canvasSettings, "pixels":newPixels});

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
    console.log(obj);
    const pixels = getClickedPixel(obj);
    console.log("YOOOOOOOOOOO",pixels);
    client.publish({
      destination:"/app/pixel",
      headers: { 'content-type': 'application/octet-stream',
        'content-length':2 },
      binaryBody:new Uint8Array([pixels.x,pixels.y])})
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

  return (
    <>
      <canvas ref={canvasRef}  onClick={onCanvasClick} className={"canvas"} width={canvasSettings.width} height={canvasSettings.height}/>
      </>
  );
};

export default App;
