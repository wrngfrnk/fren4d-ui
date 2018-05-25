import React from 'react';
import './../styles/Timeline.css';
import {dec2bin, bin2dec} from './../helpers.js';

// TODO: Prevent all thumbnails from updating on every render
// TODO: Use canvas for Thumbs

class FrameThumb extends React.Component {
    shouldComponentUpdate(nextProps) {
        return this.props.isActive || this.props.forceUpdate || this.props.isActive !== nextProps.isActive; 
    }

    renderLine(side, data) {
        return data.map((row, j) => {
            return <div key={"e" + side + "f" + this.props.num + "l" + j} className={"minipx" + ((row === 1) ? " active" : "")}></div>    
        })
    }

    render() {
        return (
            <div className={"frame-thumb " + (this.props.isActive ? 'active' : '')} onClick={() => this.props.action(this.props.num)} >
                {this.props.num}
                <div className="frame-thumb-preview">
                    <div className="eye">
                        {this.props.bin.L
                            .map((row, i) => {
                                return this.renderLine("L", dec2bin(row));
                            })
                        }
                    </div>
                    <div className="eye">
                        {this.props.bin.R
                            .map((row, i) => {
                                return this.renderLine("R", dec2bin(row));
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

class Timeline extends React.Component {
    constructor(props) {
        super(props);

        this.returnFrame = this.returnFrame.bind(this);

        this.state = {
            scroll: null,
            scrollPos: 0,
            forceUpdate: false
        }
    }

    componentWillReceiveProps(nextProps) {
        // Conditions for forcing a thumbnail update.
        this.setState({
            forceUpdate: nextProps.frames.length !== this.props.frames.length,
        });
    }

    returnFrame(frame) {
        return this.props.action(frame);
    }

    doScroll(left = true) {
        this.setState({
            scroll: setInterval(() => {
                if((left && this.state.scrollPos - 10 < 0) || (!left && (this.state.scrollPos + 15 > (this.refs.rollOuter.offsetWidth - this.refs.rollInner.offsetWidth)))) {
                    this.setState(prevState => ({
                        scrollPos: prevState.scrollPos - (left ? -25 : 25)
                    }))
                } else {
                    this.stopScroll()
                }
            }, 20)
        });
    }

    stopScroll() {
        clearInterval(this.state.scroll)
    }


    render() {
        return (
            <div id="timeline">
                <h2>Timeline</h2>
                <p>Current frame: {this.props.currentFrame + 1} of {this.props.frames.length}</p>
                <div className="timeline-inner" ref="rollOuter">
                    <div className="timeline-scroll left" onMouseEnter={() => this.doScroll(true)} onMouseLeave={() => this.stopScroll()}>&lt;</div>
                    <div id="timeline-roll" ref="rollInner" style={{left: this.state.scrollPos + "px"}} >
                        {this.props.frames
                            .map((row, i) => {
                                let isActive = this.props.currentFrame === i;
                                return <FrameThumb 
                                    key={"thumb-" + i} 
                                    num={i+1} 
                                    isActive={isActive} 
                                    action={() => this.returnFrame(i)} 
                                    bin={{L: this.props.frames[i].frameDataL, R: this.props.frames[i].frameDataR}}
                                    forceUpdate={this.state.forceUpdate}
                                />;
                            })
                        }     
                    </div>
                    <div className="timeline-scroll right" onMouseOver={() => this.doScroll(false)} onMouseLeave={() => this.stopScroll()}>&gt;</div>
                </div>
            </div>
        );
    }
}

export default Timeline;