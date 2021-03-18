import React, {useRef,useEffect, useState}  from 'react';
import * as SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';
import './App.css';
import {SwatchesPicker} from "react-color";
import {Github} from "react-color/lib/components/github/Github";
import Canvas from "./Canvas";


const App = () => {

  //Canvas
  const [canvasSettings, setCanvasSettings] = useState({
    "imageSize": 50,
    "pixels":new Array(2500).fill([0,0,0,255])
  })

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
      console.log(message.body);
      //messagePixelArray
      let mpa = JSON.parse('[' + message.body + ']')[0];
      let newCanvas = {...canvasSettings};
      mpa.map((m) => {
        let rgb = hexToRgb(swatchColors[m.color]);
      newCanvas.pixels[m.x+m.y*canvasSettings.imageSize] = [rgb.r,rgb.g,rgb.b,255]; //todo
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


  const [selectedColor, setSelectedColor] = useState(0)

  const swatchOnClick = (obj) =>{
    console.log(swatchColors.indexOf(obj.hex));
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
      <Canvas client={client} canvasSettings={canvasSettings} selectedColor={selectedColor}/>
      <Github onChange={swatchOnClick} colors={swatchColors} className={"swatch"} height={"100"}/>
    </>
  );
}

export default App;
