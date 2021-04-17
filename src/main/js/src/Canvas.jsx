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

  useEffect(x => {
    if(selectedColor !== -1){
      setXy(null);
    }
  }, [selectedColor])

  const [xy, setXy] = useState(null);

  const [wasDragged, setWasDragged] = useState(false);

  const drag = (obj) => {
    setWasDragged(true);
  }

  const onCanvasClick = (obj) => {

    const x = obj.target.clientWidth/2 - obj.nativeEvent.offsetX
    const y = obj.target.clientHeight/2 - obj.nativeEvent.offsetY

    console.log(wasDragged)
    if(wasDragged){
      setXy(null);
      setWasDragged(false);
      return;
    }

    if(selectedColor === -1){
      setXy({x: x, y:y});
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
      const p = getClickedPixel(obj);
      placePixel(p);
    }

  }

  //This is a hacky version of making sure canvas doesnt use subpixels...
  const [canvasWidthStyle, setCanvasWidthStyle] = useState({});
  const handleResize = (obj) => {
    const w = obj.target.innerWidth;
    const h = obj.target.innerHeight;
    if(w <= h){
      setCanvasWidthStyle({width: Math.round(w * 0.8),
        marginLeft: Math.round(w * 0.1)});
    }else{
      setCanvasWidthStyle({height: Math.round(h * 0.8)});
    }
  }
  useEffect(() => {
      window.addEventListener('resize', handleResize);
      handleResize({target:{innerWidth:window.innerWidth, innerHeight:window.innerHeight}})
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



    return(
      <>
        <div style={canvasStyle}>
        <Draggable scale={scale} position={xy} disabled={false} onDrag={drag}>
          <canvas ref={canvasRef}
                className={"canvas"}
                width={canvasSettings.imageSize}
                height={canvasSettings.imageSize}
                onClick={onCanvasClick}
                  onTouchStart={onCanvasClick}
                  style={canvasWidthStyle}
          />
        </Draggable>
        </div>
      </>

);
}

export default Canvas;