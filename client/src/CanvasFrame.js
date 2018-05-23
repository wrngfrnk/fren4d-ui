import React from 'react';
import {bin2dec, dec2bin} from './Helpers.js';
import Button from './Button.js';
import './Frame.css';

const canvasX = 8;
const canvasY = 8;
const canvasSize = 300;
const pixelSize = (300 / 8);

class Canvas extends React.Component {
    // TODO: Kind of reinventing the wheel here; perhaps a canvas manipulation library would be in order?
    constructor(props) {
        super(props);

        let gfxData = [];

        for(let i = 0; i < canvasX; i++) {
            let gfxRow = [];
            for(let j = 0; j < canvasY; j++) {
                gfxRow.push({
                    pos: {
                        center: {
                            x: j * pixelSize + (pixelSize / 2),
                            y: i * pixelSize + (pixelSize / 2),
                        },
                        origin: {
                            x: j * pixelSize,
                            y: i * pixelSize,
                        }
                    }
                })
            }
            gfxData.push(gfxRow);
        }

        this.state = {
            graphics: gfxData,
            drawMode: true,
            drawing: false,
            toDraw: [],
            updater: false,
        }
    }

    shouldComponentUpdate(nextProps) {
        return this.state.updater || this.props.pixelData !== nextProps.pixelData; 
    }

    componentDidMount() {
        this.updateCanvas();
    }

    componentDidUpdate() {
        this.updateCanvas();
    }

    getInitialCanvas() {
        let pixels = [];

        for(let row in this.props.pixelData) {
            pixels.push(this.props.pixelData[row]);
        }
        
        return pixels;
    }

    fillPixel(ctx, x, y, w, h, color = "#ff9922") {
        ctx.fillStyle=color;
        ctx.fillRect(x, y, w, h);
    }

    clearPixel(ctx, x, y, w, h) {
        ctx.clearRect(x, y, w, h);
    }

    fillGrid(ctx) {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        for(let i = 0; i <= 8; i++) {
            ctx.moveTo(i * pixelSize, 0);
            ctx.lineTo(i * pixelSize, canvasSize);

            ctx.moveTo(0, i * pixelSize);
            ctx.lineTo(canvasSize, i * pixelSize);
        }

        ctx.closePath();
        ctx.stroke();
    }

    markForPainting(ctx, x, y) {
        let offset = 10;
        this.fillPixel(
            ctx, 
            x + offset,
            y + offset, 
            pixelSize - (offset * 2), 
            pixelSize - (offset * 2), 
            !this.state.drawMode ? "orange" : "red")
    }

    getRelativeMouseLocation(el, x, y) {
        const elPos = el.getBoundingClientRect();

        return {
            x: Math.floor(x - elPos.x),
            y: Math.floor(y - elPos.y)
        };
    }

    getPixelByCoords(x, y) {
        return {
            x: Math.floor((x / canvasSize) * canvasX), 
            y: Math.floor((y / canvasSize) * canvasY)
        }
    }

    getPixelActive(x, y) {
        return dec2bin(this.props.pixelData[y])[x] === 1;
    }

    updatePixels() {
        let newBin = this.props.pixelData.map((dec) => {
            return dec2bin(dec)
        });

        let rowsToReplace = [];
        let replaceRows = [];

        for(let i in this.state.toDraw) {
            let px = this.state.toDraw[i]
            newBin[px.y][px.x] = px.active ? 0 : 1;
        }

        for(let i in newBin) {
            newBin[i] = bin2dec(newBin[i]);
            if(newBin[i] !== this.props.pixelData[i]) {
                replaceRows.push({row: i, dec: newBin[i]});
            }
        }

        this.props.actions(replaceRows);
        
        this.setState({
            toDraw: [],
            updater: false,
        }, this.forceUpdate());

    }

    addToDraw(e, x, y, state) {
        this.setState(prevState => ({
            toDraw: prevState.toDraw.concat({
                x: x,
                y: y,
                active: state
            })
        }));
    }

    startDraw(e) {
        // TODO: roll this into the PaintDraw method
        if(e.buttons === 0 || e.button === 0) {
            const clickedLocation = this.getRelativeMouseLocation(e.target, e.clientX, e.clientY);
            const clickedPixel = this.getPixelByCoords(clickedLocation.x, clickedLocation.y);
            const clickedPixelCenterPos = this.state.graphics[clickedPixel.y][clickedPixel.x].pos.center;
            const pixelIsActive = this.getPixelActive(clickedPixel.x, clickedPixel.y);
            
            this.setState({
                drawing: true,
                drawMode: pixelIsActive,
            }, () => {
                this.addToDraw(e, clickedPixel.x, clickedPixel.y, pixelIsActive);
            });
        }
    }

    paintDraw(e) {
        if(this.state.drawing){
            const hoverLocation = this.getRelativeMouseLocation(e.target, e.clientX, e.clientY);
            const hoverPixel = this.getPixelByCoords(hoverLocation.x, hoverLocation.y);
            const hoverPixelOriginPos = this.state.graphics[hoverPixel.y][hoverPixel.x].pos.origin;
            
            this.markForPainting(this.refs[this.props.canvasid].getContext('2d'), hoverPixelOriginPos.x, hoverPixelOriginPos.y);

            if(!this.state.toDraw.find(px => {
                return (px.x === hoverPixel.x && px.y === hoverPixel.y) ? true : false
            })){
                this.addToDraw(null, hoverPixel.x, hoverPixel.y, this.state.drawMode);
            }
        }
    }

    applyDraw() {
        this.setState({
            drawing: false,
            drawMode: false,
        }, this.updatePixels());
    }

    updateCanvas() {
        const ctx = this.refs[this.props.canvasid].getContext('2d');

        for(let row in this.props.pixelData) {
            const binRow = dec2bin(this.props.pixelData[row]);
            for(let p in binRow) {
                const pxPos = this.state.graphics[row][p].pos.origin;
                if(binRow[p] === 1){
                    this.fillPixel(ctx, pxPos.x, pxPos.y, pixelSize, pixelSize);
                } else {
                    this.clearPixel(ctx, pxPos.x, pxPos.y, pixelSize, pixelSize);
                }
            }
        }

        this.fillGrid(ctx);
    }

    render() {
        return(
            <canvas 
                ref={this.props.canvasid} 
                className="frame-grid" 
                id={this.props.canvasid}
                height={canvasSize}
                width={canvasSize}
                onMouseDown={e => this.startDraw(e)}
                onMouseMove={e => this.paintDraw(e)}
                onMouseUp={() => this.applyDraw()}
                onMouseLeave={() => this.applyDraw()}
            />
        )
    }
}

class CanvasFrame extends React.Component {
    constructor(props) {
        super(props);
        this.controlActions = this.controlActions.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        this.bin2dec = bin2dec.bind(this);
        this.dec2bin = dec2bin.bind(this);

        this.state = {
            pixelRows:  [],
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ 
            pixelRows: nextProps.frameData,
        });
    }

    shouldComponentUpdate(nextProps){
        return nextProps.frameData !== this.state.pixelRows;
    }

    renderControls() {
        return <FrameControls actions={this.controlActions()} />;
    }

    renderCanvas() {
        return <Canvas pixelData={this.state.pixelRows} canvasid={"canvas-" + (this.props.eye === 0 ? 'l' : 'r')} actions={this.clickHandler}/>;
    }

    controlActions(...args) {
        // TODO: Implement arguments
        // TODO: Make "pixelrows" a separate class and implement all this as methods.
        args = Array.from(args);

        let undo = ()       => { return; } // TODO: Anything
        
        let flipX = ()      => { 
            let newRows = this.state.pixelRows.map(row => {
                return bin2dec(dec2bin(row).reverse());
            }); 

            return apply(newRows);
        }

        let flipY = ()      => { return apply(this.state.pixelRows.reverse()); }
        
        let invert = ()     => { 
            let newRows = this.state.pixelRows.map(row => {
                return Math.abs(row - 255);
            }); 

            return apply(newRows);
        }
        
        let mirrorX = ()    => { 
            let newRows = this.state.pixelRows.map(row => {
                let bin = dec2bin(row);
                return bin2dec([...bin.slice(0, 4), ...bin.slice(0, 4).reverse()]);
            });

            return apply(newRows);
        }
        
        let mirrorY = ()    => { 
            let newRows = [...this.state.pixelRows.slice(0, 4), ...this.state.pixelRows.slice(0, 4).reverse()];
            return apply(newRows);
        }

        let fillRandom = () => {
            return apply(Array.from({length: 8}, () => Math.floor(Math.random() * 255))); 
        }
        
        let clear = ()      => { return apply(Array(8).fill(0)); } 

        let shiftUp = ()    => { 
            let newRows = [...this.state.pixelRows.slice(1,8), this.state.pixelRows[0]];
            return apply(newRows);
        }

        let shiftDown = ()    => {
            let newRows = [this.state.pixelRows[7], ...this.state.pixelRows.slice(0,7)];
            return apply(newRows);
        }

        let shiftRight = ()    => {
            let newRows = this.state.pixelRows.map(row => {
                // Shifting 00001001 right would result in 00000100. This is a problem, because we want the pixels to "wrap around" when shifting them out of bounds.
                // However, the last bit being 1 means that the decimal value is odd. Thus, we can simply add 128 to the resulting value when one bit is pushed out.

                return parseInt(row % 2 === 1 ? (row >> 1) + 128 : row >> 1, 10) 
            });

            return apply(newRows);
        }

        let shiftLeft = ()    => { 
            // Here we kind of have the same problem as the right shift. Bits shifted off to the left will overflow the value (> 255).
            // To solve this, we can use the fact that all values >= 128 means that the first bit is 1. So, if the first bit is 1, remove 128 (i.e. setting it to 0) and then shift them.
            // Then add 1 to the shifted value to set the last bit to 1, thus effectively wrapping the bits around!

            let newRows = this.state.pixelRows.map(row => {
                return (row >= 128 ? ((row - 128) << 1) + 1: row << 1)
            });

            return apply(newRows) 
        }

        const apply = (newRows) => { // Probably rename this
            return this.props.onUpdate(this.props.eye, newRows)
        }

        return {
            modify: {
                undo: undo,
                flipX: flipX,
                flipY: flipY,
                invert: invert,
                mirrorX: mirrorX,
                mirrorY: mirrorY,
                random: fillRandom,
                clear: clear,
            },
            shift: {
                up: shiftUp,
                right: shiftRight,
                down: shiftDown,
                left: shiftLeft,
            }
        }
    }

    clickHandler(updatedRows = [{row: 0, dec: 0}]) {
        let newRows = this.state.pixelRows;
        for(let i in updatedRows) {
            newRows[updatedRows[i].row] = updatedRows[i].dec
        }

        this.props.onUpdate(this.props.eye, newRows)
    
        return;
    }

    render() { 
        return (
            <div className="frame">
                <div className="frame-controls">
                    {this.renderControls() /* Directly mount the component maybe? */} 
                </div>
                <div className="frame-container">
                    <FrameShifter key={"shift-up"} dir={"up"} action={this.controlActions().shift.up} label="^" />
                    <FrameShifter key={"shift-left"} dir={"left"} action={this.controlActions().shift.left} label="<" />
                    {this.renderCanvas()}
                    <FrameShifter key={"shift-right"} dir={"right"} action={this.controlActions().shift.right} label=">" />
                    <FrameShifter key={"shift-down"} dir={"down"} action={this.controlActions().shift.down} label="v" />
                </div>
            </div>
        );
    }
}

class FrameControls extends React.Component {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
           <div className="frame-control-group">
                {Object.keys(this.props.actions.modify).map(a => {
                    // Output buttons for all the actions from the bound function handler
                    return <Button key={"action-" + a} action={this.props.actions.modify[a]} buttonClass="frame-control" text={a} />
                    })
                }
            </div>
        );
    }
}

class FrameShifter extends React.Component {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <Button buttonClass={"frame-shift " + this.props.dir} action={this.props.action} text={this.props.label} />
        );
    }

}

export default CanvasFrame;