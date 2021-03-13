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

  const client = new Client({
    brokerURL: 'ws://localhost:8080/ws',
    debug: function (str) {
      console.log(str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  useEffect(() => {

    client.onConnect = (frame) => {
      client.subscribe("/topic/place", (sub) => {console.log(sub.body)})
      console.log("Connected: " + frame);
    }

    client.onStompError =  (frame) => {
      console.log('Broker reported error: ' + frame.headers['message']);
      console.log('Additional details: ' + frame.body);
    };

    client.activate();


  },[]);



  const callback = (message) => {
    if (message.body) {
      console.log(message.body)
      const mb = JSON.parse("[" + message.body + "]")[0];
      canvasSettings.pixels[9] = [mb[0]*17,mb[1]*17,mb[2]*17,mb[3]*17]; //Confusing Code clean up
      setCanvasSettings({...canvasSettings})
    } else {
      console.log("got empty message");
    }
  };

  useEffect(() => {
    //Get context for canvas
    const canvasObj = canvasRef.current;
    const ctx = canvasObj.getContext("2d");

    //Create imageData
    const imageData = new ImageData(new Uint8ClampedArray(canvasSettings.pixels.flat()),canvasSettings.width,canvasSettings.height);
    //Display imageData
    ctx.putImageData(imageData,0,0);
  },[canvasSettings])

  const onCanvasClick = (obj) => {
    const pixels = getClickedPixel(obj);
    client.publish({destination:"/app/pixel", body:JSON.stringify(pixels), headers:{}})
    console.log(pixels);

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
