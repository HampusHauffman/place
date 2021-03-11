import React, {useRef,useEffect, useState}  from 'react';
import * as SockJS from 'sockjs-client';
import {Client, Message, Stomp} from '@stomp/stompjs';
import './App.css';


const App = () => {

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

  //sock
  const callback = (message) => {
    if (message.body) {
      alert("got message with body " + message.body)
    } else {
      alert("got empty message");
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

    //STOMP
    var socket = new SockJS('http://localhost:8080/ws/');
    var stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
      console.log('Connected: ' + frame);
      stompClient.subscribe('/topic/place', function (greeting) {
        console.log(greeting.body);
      });
    });

  },[]);

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

  const onCanvasClick = (obj) => {
    console.log(getClickedPixel(obj));
  }


  return (
    <>
      <canvas ref={canvasRef}  onClick={onCanvasClick} className={"canvas"} width={canvasSettings.width} height={canvasSettings.height}/>
      </>
  );
};

export default App;
