import React, {useRef,useEffect, useState}  from 'react';
import Draggable from 'react-draggable';
import './App.css';


const Canvas = ({client, canvasSettings, selectedColor, pixel}) => {

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

    handleResize({target:{innerWidth:window.innerWidth, innerHeight:window.innerHeight}})

  },[canvasSettings])

  useEffect(() => {
    if(pixel) {
      const imageData = new ImageData(
          new Uint8ClampedArray([pixel.color.r, pixel.color.g, pixel.color.b, 255]), 1, 1);
      const canvasObj = canvasRef.current;
      const ctx = canvasObj.getContext("2d");
      ctx.putImageData(imageData, pixel.x, pixel.y);
    }
  },[pixel])


  const [canvasStyle, setCanvasStyle] = useState();
  const [scale, setScale] = useState(1);


  const setCanvasTransformStyle = (s) =>{
    setCanvasStyle({...canvasStyle, transform: "scale(" + s + "," + s + ")"})
  }

  const placePixel = (p) => {
    if(selectedColor === -1){
      return;
    }
    client.publish({
      destination:"/pixel",
      body: JSON.stringify({"x":p.x, "y":p.y, "color":selectedColor})
    })
  }

  let [xy, setXy] = useState(null)

  let dragged = false;

  const startTouch = useRef(null);

  let dragCount = 0;

  const drag = (obj) => {
    if(dragCount++ > 3) { //logic so you can drag a tiny bit and still place pixels
      dragged = true;
      setXy(null);
    }
  }

  const mouseEvent = (e, obj) => {
    if(e.targetTouches) {
      startTouch.current = e.targetTouches[0];
    }
  };

  const onCanvasClick = (e, obj) => {
    let x;
    let y;

    var rect = e.target.getBoundingClientRect();

    x = e.target.clientWidth/2 - ((rect.width/(1000*scale)) * getClickedPixel(e).x)
    y = e.target.clientHeight/2 - ((rect.height/(1000*scale)) * getClickedPixel(e).y)


    if(dragged){
      dragged = false
      dragCount = 0;
      setXy (null);
      return;
    }else if(selectedColor === -1){
      setXy ({x:x,y:y})
    }

    if(scale===1) {
      setScale(8);
      setCanvasTransformStyle(8)
    }else if(scale===8){
      setScale(40);
      setCanvasTransformStyle(40)
    }else if(scale===40 && selectedColor === -1){
      setScale(1);
      setCanvasTransformStyle(1)
    }else {
      const p = getClickedPixel(e);
      placePixel(p);
    }

  }

  //This is a hacky version of making sure canvas doesnt use subpixels...
  const [canvasWidthStyle, setCanvasWidthStyle] = useState({});
  const handleResize = (obj) => {
    const w = obj.target.innerWidth;
    const h = obj.target.innerHeight;
    const cw = canvasRef.current.getBoundingClientRect().width
    if(w <= h){
      setCanvasWidthStyle({width: Math.round(w * 0.8),
        marginLeft: Math.round(w * 0.1)});
    }else{
      setCanvasWidthStyle({width: Math.round(h * 0.8),
        marginLeft: Math.round((w/2)-(cw/2))});
    }
  }
  useEffect(() => {
      window.addEventListener('resize', handleResize);
  },[]);

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


    return(
      <>
        <div style={canvasStyle}>
        <Draggable nodeRef={canvasRef} scale={scale} position={xy} onDrag={drag} onStop={onCanvasClick} onStart={mouseEvent}>
          <canvas
                ref={canvasRef}
                className={"canvas"}
                width={canvasSettings.imageSize}
                height={canvasSettings.imageSize}
                style={canvasWidthStyle}
          />
        </Draggable>
        </div>
      </>

);
}

export default Canvas;