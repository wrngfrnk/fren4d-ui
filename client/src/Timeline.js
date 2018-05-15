import React from 'react';
import './Timeline.css';

class FrameThumb extends React.Component {
    renderLine(side, i, width) {
        return <div key={"e" + side + "f" + this.props.num + "l" + i} className="line" style={{width: width + "%"}}></div>
    }

    render() {
        return (
            <div className={"frame-thumb " + (this.props.isActive ? 'active' : '')} onClick={() => this.props.action(this.props.num)} >
                {this.props.num}
                <div className="frame-thumb-preview">
                    <div className="eye">
                        {this.props.bin.L
                            .map((row, i) => {
                                return this.renderLine("L", i, (row / 255) * 100);
                            })
                        }
                    </div>
                    <div className="eye">
                        {this.props.bin.R
                            .map((row, i) => {
                                return this.renderLine("R", i, (row / 255) * 100);
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
            frames: [],
            scroll: null,
            scrollPos: 0,
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ 
            frames: nextProps.frames,
        });
    }

    returnFrame(frame) {
        return this.props.action(frame);
    }

    doScroll(left = true) {
        this.setState({
            scroll: setInterval(() => {
                if((left && this.state.scrollPos < 0) || (!left && (this.state.scrollPos > (this.refs.rollOuter.offsetWidth - this.refs.rollInner.offsetWidth)))) {
                    this.setState(prevState => ({
                        scrollPos: prevState.scrollPos - (left ? -10 : 10)
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
            <div>
                <h2>Timeline</h2>
                <p>Current frame: {this.props.currentFrame + 1} of {this.state.frames.length}</p>
                <div id="timeline" ref="rollOuter">
                    <div className="timeline-scroll left" onMouseEnter={() => this.doScroll(true)} onMouseLeave={() => this.stopScroll()}></div>
                    <div id="timeline-roll" ref="rollInner" style={{left: this.state.scrollPos + "px"}} >
                        {this.state.frames
                            .map((row, i) => {
                                let isActive = this.props.currentFrame === i;
                                return <FrameThumb 
                                    key={"thumb-" + i} 
                                    num={i+1} 
                                    isActive={isActive} 
                                    action={() => this.returnFrame(i)} 
                                    bin={{L: this.props.frames[i].frameDataL, R: this.props.frames[i].frameDataR}} 
                                />;
                            })
                        }     
                    </div>
                    <div className="timeline-scroll right" onMouseOver={() => this.doScroll(false)} onMouseLeave={() => this.stopScroll()}></div>
                </div>
            </div>
        );
    }
}

export default Timeline;