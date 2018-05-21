import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { bin2dec, dec2bin } from './Helpers.js';
import Sidebar from './Sidebar.js';
import Button from './Button.js';
import Timeline from './Timeline.js';

// TODO: Separate into different files per class if necessary
// TODO: Use a Sass loader w/ webpack to directly deal with the sass files
// TODO: Saving/loading to JSON
// TODO: Integrate with robot!

class Pixel extends React.Component {
    // TODO: Change onClick to something else that allows clicking and dragging to activate several pixels at once
    render() {
        return (
            <button className={`pixel${this.props.active ? " active" : ""}`} onMouseDown={this.props.action} onMouseOver={this.props.action}></button>
        );
    }
}

class PixelRow extends React.Component {
    constructor(props) {
        super(props);
        this.bin2dec = bin2dec.bind(this);
        this.dec2bin = dec2bin.bind(this);
    }

    updateRow(e, x, y, active) {
        if(e.buttons === 1) {
            let newBin = this.dec2bin(this.props.bin);
            newBin[x] = active ? 1 : 0;
         
            let dec = this.bin2dec(newBin);
            this.props.clickHandler(y, dec);
        }
    }

    getCurrentPixelActive(x) {
        return this.dec2bin(this.props.bin)[x] === 1;
    }

    renderPixel(y, x, active) {
        return <Pixel key={"pixel" + y + "" + x} x={x} y={y} active={ active } action={e => this.updateRow(e, x, y, !active)} />;
    } 

    render() {
        return (
            <div className="pixel-row">
                {Array.from(Array(8).keys()).map((x) => 
                    this.renderPixel(this.props.y, x, this.getCurrentPixelActive(x))
                )}
            </div>
        );
    }
}

class Frame extends React.Component {
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

    renderControls() {
        return <FrameControls actions={this.controlActions()} />;
    }

    controlActions(...args) {
        args = Array.from(args); // TODO: Implement arguments, move all this somewhere else

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

    clickHandler(row, dec) {
        let newRows = this.state.pixelRows;
        newRows[row] = dec;

        this.props.onUpdate(this.props.eye, newRows)
    
        return;
    }

    render() {
        const rows = this.state.pixelRows.length;
        return (
            <div className="frame">
                <div className="frame-controls">
                    {this.renderControls() /* Directly mount the component maybe? */} 
                </div>
                <div className="frame-container">
                    <FrameShifter key={"shift-up"} dir={"up"} action={this.controlActions().shift.up} label="^" />
                    <FrameShifter key={"shift-left"} dir={"left"} action={this.controlActions().shift.left} label="<" />
                    <div className="frame-grid">
                        {Array.from(Array(rows).keys()).map((i) =>
                            <PixelRow y={i} clickHandler={this.clickHandler} bin={this.state.pixelRows[i]} key={"row" + i} />
                        )}
                    </div>
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

class Matrix extends React.Component {
    // TODO: Let this handle currentFrame, frameTime
    constructor(props) {
        super(props);

        this.setCurrentFrame = this.setCurrentFrame.bind(this);
        this.previewAnim = this.previewAnim.bind(this);
        this.updateFrame = this.updateFrame.bind(this);
        this.saveAnimation = this.saveAnimation.bind(this);

        this.state = {
            animation: {
                frames: [{
                    frameDataL: [],
                    frameDataR: [],
                    frameTime: 0
                }],
                mood: []
            },
            currentFrame: 0,
        }
    }

    componentDidMount() { // Get initial data
        fetch('/frame/load/test') // TODO: Some way to handle left vs right eye (SAme graphic? Mirrored? Completely separated?)
            .then(res => res.json())
            .then(res => this.setState({ animation: res.animation }));
    }

    getLength() {
        return this.state.animation.frames.length;
    }

    setCurrentFrame(frame = 0) {
        this.setState({
            currentFrame: frame
        });
    }

    prevFrame() {
        return (this.state.currentFrame - 1 <= 0) ? 0 : this.state.currentFrame - 1;
    }

    nextFrame() {
        let nextFrame = this.state.currentFrame + 1 === this.state.animation.frames.length ? this.state.currentFrame : this.state.currentFrame + 1;
        return nextFrame;
   }

    addFrame(newData = {frameDataL: Array(8).fill(0), frameDataR: Array(8).fill(0), frameTime: 1000}) {
        let newFrames = [
            ...this.state.animation.frames.slice(0, this.state.currentFrame + 1).concat(newData),
            ...this.state.animation.frames.slice(this.state.currentFrame + 1, this.getLength())
        ]

        this.setState({
            animation: {
                frames: newFrames
            }
        })

        setTimeout(() => {
            this.setCurrentFrame(this.nextFrame())
        }, 10); // Ugly hack to wait for the state to be set before proceeding to the next frame.
    }

    duplicateFrame() {
        let template = JSON.parse(JSON.stringify(
            this.state.animation.frames.slice(this.state.currentFrame, this.state.currentFrame + 1)[0]
        )); // Ugly hack to deep copy template data
        
        return this.addFrame(template)
    }

    deleteFrame() {
        let newFrames = [...this.state.animation.frames.slice(0, this.state.currentFrame), ...this.state.animation.frames.slice(this.state.currentFrame + 1, this.state.animation.frames.length)];

        if(this.state.currentFrame + 1 === this.getLength()) {
            this.setCurrentFrame(this.prevFrame());
        }

        this.setState({
            animation: {
                frames: newFrames
            }
        });
    }

    updateFrame(eye, data) {
        let targetEye = "frameData" + (eye === 0 ? 'L' : 'R');
        let newFrame = this.state.animation.frames;
        
        newFrame[this.state.currentFrame][targetEye] = data;

        this.setState({
            animation: {
                frames: newFrame
            }
        });
    }

    updateFrameTime(val) {
        let newFrame = this.state.animation.frames;
        newFrame[this.state.currentFrame].frameTime = val;

        this.setState({
            animation: {
                frames: newFrame
            }
        });
    }

    copyLR(eye = 0) {
        let template = JSON.parse(JSON.stringify(this.state.animation.frames[this.state.currentFrame]))
        let newEye = (eye === 1) ? template.frameDataL : template.frameDataR;

        this.updateFrame(eye, newEye);
    }

    previewAnim() {
        if(!this.state.previewing) {
            let saveFrame = this.state.currentFrame;
            this.setCurrentFrame();
            this.setState({
                previewing: true
            })
            let play = () => {
                setTimeout(() => {
                    if(this.state.currentFrame + 1 !== this.state.animation.frames.length) {
                        this.setCurrentFrame(this.nextFrame());
                        play();
                    } else {
                        this.setState({
                            currentFrame: saveFrame,
                            previewing: false,
                        });
                    }
                }, this.state.animation.frames[this.state.currentFrame].frameTime);
            }

            return play();
        }
    }

    saveAnimation() {
        const url = '/frame/save/test';
        const data = this.state.animation;

        fetch(url, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: new Headers({
            'Content-Type': 'application/json'
          }),
        }).then(console.log("Saved it, probably."))
    }

    render() {
        return (
            <div id="wrapper">
                {this.state.previewing ? <div id="previewing">PREVIEWING...</div> : null}
                <Sidebar />
                <Button
                    action={() => this.saveAnimation()}
                    text="Save animation"
                />
                <div className="frame-change">
                    <Button 
                        action={() => this.setCurrentFrame(this.prevFrame())} 
                        text="Prev frame" 
                        disabled={this.state.currentFrame === 0}
                    />

                    <Button 
                        action={() => this.addFrame()} 
                        text="Add frame" 
                    />
                    
                    <Button 
                        action={() => this.setCurrentFrame(this.nextFrame())} 
                        text="Next frame" 
                        disabled={this.state.currentFrame +1 === this.state.animation.frames.length}
                    /> 

                    <br />

                    <Button 
                        action={() => this.duplicateFrame()} 
                        text="Duplicate frame"
                    />
                    
                    <Button 
                        action={() => this.deleteFrame()} 
                        text="Delete frame"
                        disabled={this.state.animation.frames.length <= 1}
                    />
                </div>
                <Button action={this.previewAnim} text="Preview Animation"  />
                <div id="frame-clone">
                    <Button action={() => this.copyLR(1)} text="Copy L > R" />
                    <Button action={() => this.copyLR(0)} text="Copy L < R" />
                </div>
                <div id="frame-time"> {/* TODO: Make the frametime easier to set */}
                    Frame Time: 
                    <input 
                        list="frametimes" 
                        type="range" 
                        min="10" 
                        max="1000"
                        step="10"
                        onChange={e => {this.updateFrameTime(e.target.value)}} 
                        value={this.state.animation.frames[this.state.currentFrame].frameTime}
                    /> 
                    {this.state.animation.frames[this.state.currentFrame].frameTime} ms
                </div>
                <div id="frame-main">
                    <Frame eye={0} frameData={this.state.animation.frames[this.state.currentFrame].frameDataL} onUpdate={this.updateFrame} />
                    <Frame eye={1} frameData={this.state.animation.frames[this.state.currentFrame].frameDataR} onUpdate={this.updateFrame} />
                </div>
                <Timeline frames={this.state.animation.frames} currentFrame={this.state.currentFrame} action={this.setCurrentFrame} />
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Matrix />,
    document.getElementById('root')
);