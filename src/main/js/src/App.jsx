import React, {useEffect, useState} from 'react';
import {Client} from '@stomp/stompjs';
import './App.css';
import Canvas from "./Canvas";
import {CirclePicker} from "react-color";
import Modal from "react-modal";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton
} from "react-share";

const App = () => {

  const size = 1000;
  //Canvas
  const [canvasSettings, setCanvasSettings] = useState({
    "imageSize": size,
    "pixels": new Array(Math.pow(size, 2)).fill([0, 0, 0, 255]),
  })

  const [pixel, setPixel] = useState(null);

  const [client, setClient] = useState(new Client({
    //brokerURL: 'wss://place-run-qsjhjkmw7a-ew.a.run.app/ws',
    brokerURL: 'ws://localhost:8080/ws',

    debug: function (str) {
      //console.log(str);
    },

    reconnectDelay: 10,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  }));

  const handleBinaryMessage = (message) => {
    let newCanvas = {...canvasSettings};
    const b = new Uint8Array(Math.pow(size, 2));
    let i = 0;

    for (i; i < Math.pow(size, 2) / 2; i++) { //Bytes represent 2 colors 1111 1000
      let one = i * 2;
      let two = i * 2 + 1;
      b[one] = message.binaryBody[i] >>> 4; //parses 8bit (byte) data to 4bit data (color)
      b[two] = message.binaryBody[i] & 15;

      let rgb1 = hexToRgb(swatchColors[b[one]]);
      let rgb2 = hexToRgb(swatchColors[b[i * 2 + 1]]);

      newCanvas.pixels[one] = [rgb1.r, rgb1.g, rgb1.b, 255];
      newCanvas.pixels[two] = [rgb2.r, rgb2.g, rgb2.b, 255];
    }
    setCanvasSettings(newCanvas);

  }

  //STOMP
  const callback = (message) => {
    if (message.headers['content-type'] === 'application/octet-stream') { //check if binary
      handleBinaryMessage(message);
    } else if (message.body) { //if json
      const m = JSON.parse(message.body);
      setPixel({...m, "color": hexToRgb(swatchColors[m.color])}); //convert to hex to rgb
    }
    client.ack(message.headers['message-id'], message.headers.subscription); //dont know if i neeed to do this

  };

  client.onConnect = (frame) => {

    client.subscribe("/topic/place", callback);
    console.log("Connected: " + frame);
  }

  client.onStompError = (frame) => {
    console.log('Broker reported error: ' + frame.headers['message']);
    console.log('Additional details: ' + frame.body);
  };

  useEffect(() => {
    client.activate();
  }, []);

  const [selectedColor, setSelectedColor] = useState(
      Math.round(Math.random() * 15))

  const swatchOnClick = (obj) => {
    setSelectedColor(swatchColors.indexOf(obj.hex.toUpperCase()));
  }

  const swatchColors = [ //TODO change this if you reset the board
    '#FFFFFF',
    '#E4E4E4',
    '#888888',
    '#222222',
    '#E50000',
    '#E59500',
    '#A06A42',
    '#E5D900',
    '#94E044',
    '#02BE01',
    '#00D3DD',
    '#0083C7',
    '#0000EA',
    '#FFA7D1',
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

  const [swatchUp, setSwatchUp] = useState(false);

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
  const [modalOpen, setModalOpen] = useState(false);

  return (
      <>

        <meta name='viewport'
              content='width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0'/>

        <Canvas client={client} canvasSettings={canvasSettings}
                selectedColor={selectedColor} pixel={pixel}/>


        <div className={"buttons"}
             style={swatchUp ? {bottom: 0} : {bottom: -200}}>
          <button className={"colorButton extraButton"}
                  onClick={() => {
                    setSwatchUp(prevState => !prevState)
                  }}
                  style={{backgroundColor: swatchColors[selectedColor]}}
          />
          <CirclePicker onChange={swatchOnClick} colors={swatchColors}
                        circleSize={35} width={212}/>
        </div>


        <button onClick={() => {
          setModalOpen(true)
        }}
                className={"extraButton resetButton"}
                style={{
                  backgroundColor: swatchColors[selectedColor],
                  marginTop: 50
                }}
        >
          <b>i</b>
        </button>

        <Modal
            isOpen={modalOpen}
            onRequestClose={() => {
              setModalOpen(false)
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
            <span style={{marginTop: -2}}>x</span>
          </button>
          <br/>
          <h2 style={{marginTop: -10}}>Info! </h2>
          <h3>
            Thank you for using this website!
          </h3>
          <p>
            It would mean the world if you shared it!
            <br/>
            Imagine the crazy pictures that you could draw with the help of your
            friends!
          </p>

          <FacebookShareButton url={"https://pxl.place"}
                               quote={"Come draw with me over at pxl.place. A shared canvas of 1,000,000 pixels"}
                               hashtag={"#pxl.place"} style={{marginRight: 10}}>
            <FacebookIcon size={32} round={true}/>
          </FacebookShareButton>

          <TwitterShareButton url={"https://pxl.place"}
                              title={"pxl.place a shared canvas of 1,000,000 pixels!"}
                              style={{marginRight: 10}}>
            <TwitterIcon size={32} round={true}/>
          </TwitterShareButton>

          <LinkedinShareButton url={"https://pxl.place"}
                               title={"pxl.place a shared canvas of 1,000,000 pixels!"}
                               summary={"pxl.place a shared canvas of 1,000,000 pixels!"}
                               source={"pxl.place"} style={{marginRight: 10}}>
            <LinkedinIcon size={32} round={true}/>
          </LinkedinShareButton>
        </Modal>

      </>
  );
};

export default App;
