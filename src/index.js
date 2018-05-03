import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// TODO: Separate into different files per class if necessary
// TODO: Use a Sass loader w/ webpack to directly deal with the sass files
// TODO: Saving/loading to JSON
// TODO: Integrate with robot!

class Pixel extends React.Component {
    // TODO: Change onClick to something else that allows clicking and dragging to activate several pixels at once
    render() {
        return (
            <button className={`pixel${this.props.active ? " active" : ""}`} onClick={this.props.action}></button>
        );
    }
}

class PixelRow extends React.Component {
    // TODO: Be consistent with (x, y) vs (y, x)
    constructor(props) {
        super(props);
        this.clickHandler = this.clickHandler.bind(this);
        this.state = {
            binaryValue: this.props.bin,
        }
    }

    dec2bin(dec = 0) {
        // Return zero padded binary value of 0 to 255 as array of ints
        let bin = (dec > 255 ? 255 : dec).toString(2);
        return Array.from("00000000".substr(bin.length) + bin).map(val => parseInt(val, 10));
    }

    bin2dec(bin = Array(8).fill(0)) {
        // Return decimal representation of binary array as int
        let dec = Array.from(bin).join(''); // Convert the argument to an actual array, because we cannot call join() on arguments (the argument object is not an array)
        return parseInt(dec, 2); 
    }

    clickHandler(e, x, y, active) {
        let oldBinaryValue = this.dec2bin(this.state.binaryValue);  // TODO: Reduxify to store this state
        oldBinaryValue[x] = (active ? 1 : 0);
        let newBinaryValue = oldBinaryValue;                        // TODO: Not like this

        this.setState({
            binaryValue: this.bin2dec(newBinaryValue),
        });
    }

    getCurrentPixelActive(x) {
        return this.dec2bin(this.state.binaryValue)[x] === 1;
    }

    renderPixel(y, x, active) {
        return <Pixel key={"pixel" + y + "" + x} x={x} y={y} active={active} action={e => this.clickHandler(e, x, y, !active)}/>;
    }

    render() {
        const cols = 8
        

        return (
            <div>
                {Array.from(Array(cols).keys()).map((x) => 
                    this.renderPixel(this.props.y, x, this.getCurrentPixelActive(x))
                )}
                {this.state.binaryValue}
            </div>
        );
    }    
}

class Frame extends React.Component {
    constructor(props) {
        super(props);
        /* let loadedFrame = loadASavedFrameOrSomething;*/
        this.state = {
            pixelRows: Array(8).fill(0), 
        }
    }

    getRowBinaryValue(row) {

    }

    renderControls() {
        return <FrameControls />;
    }

   renderDebug(frame) {
        return <FrameDebug frameData={frame} />;
    }

    render() {
        const rows = this.state.pixelRows.length;

        return (
            <div>
                <div className="frame-controls">
                    {this.renderControls() /* Directly mount the component maybe? */} 
                </div>
                <div className="frame-container">
                    {Array.from(Array(rows).keys()).map((i) =>
                        <PixelRow y={i} bin={this.state.pixelRows[i]} key={"row" + i} />
                    )}
                </div>
                <div className="frame-timeline">
                    <FrameTimeline />
                </div>
                <div className="frame-debug">
                    {this.renderDebug(this.state.pixelRows)}
                </div>
            </div>
        )
    }
}

class FrameControls extends React.Component {
    constructor() {
        super()
        this.state = {
            frameTime: 0
        }
    }

    render() {
        return (
            <div>
                <div className="frame-control-group">
                    <button>Previous frame</button>
                    <button>Next frame</button>
                </div>
                <div className="frame-control-group">
                    <button>Undo</button>
                    <button>Clear</button>
                    <button>Flip x</button>
                    <button>Flip y</button>
                    <button>Mirror x</button>
                    <button>Mirror y</button>
                    <button>Invert</button>
                </div>
                <div className="frame-control-group">
                    Frame time <input type="range" min="0" max="30000" step="10" id="frameTime" onChange={e => this.setState({frameTime: e.target.value})} /> {this.state.frameTime} ms
                </div>
            </div>
        );
    }
}

class FrameTimeline extends React.Component {
    render() {
        return (
            <div>Show all frames in the animation on a timeline here</div>
        );
    }
}

class Sidebar extends React.Component {
    // ...
    render() {
        return(
            <div>
                8x8 Led Matrix Animation Creator Thing
                <div className="menu">
                    <button>Save animation</button>
                    <button>Load animation</button>
                    <button>Delete animation</button>
                </div>
            </div>
        )
    }
}

class FrameDebug extends React.Component {
    render() {
        return (
            <div>Some debug info here</div>
        );
    }
}


class Matrix extends React.Component {
  render() {
    return (
        <div id="wrapper">
            <div id="sidebar">
                <Sidebar />
            </div>
            <div id="frame-main">
                <div className="frame">
                    <Frame />
                </div>
            </div>
        </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Matrix />,
  document.getElementById('root')
);
