import React, {useRef,useEffect, useState}  from 'react';
import * as SockJS from 'sockjs-client';
import {Client, Message, Stomp, StompConfig} from '@stomp/stompjs';
import SockJsClient from 'react-stomp';
import './App.css';


const App = () => {
  //Webhook
  const socket = new SockJS('http://localhost:8080/ws/');
  const stompClient = Stomp.over(socket);

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

  useEffect(() => {
    //STOMP
    stompClient.connect({}, function (frame) {
      //console.log('Connected: ' + frame);
      stompClient.subscribe('/topic/place', callback);
    });

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
    console.log(canvasSettings);
  },[canvasSettings])

  const onCanvasClick = (obj) => {
    console.log(getClickedPixel(obj));
    stompClient.send("/app/hello", {}, JSON.stringify({"x":3,"y":3}));

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
      <SockJsClient url={ wsSourceUrl } topics={["/topic/all"]}
                    onMessage={ this.onMessageReceive } ref={ (client) => { this.clientRef = client }}
                    onConnect={ () => { this.setState({ clientConnected: true }) } }
                    onDisconnect={ () => { this.setState({ clientConnected: false }) } }
                    debug={ false }/>
      </>
  );
};

export default App;
