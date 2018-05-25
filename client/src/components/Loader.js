import React, { Component } from 'react';

const dotSize = 7;
const dotSpacing = 5;

class Loader extends Component {
    constructor() {
        super();
        
        this.state = {
            loop: 0,
            iid: null
        }
    }

    componentDidMount() {
        if(!this.state.iid) {
            this.setState({
                 iid: setInterval(() => {
                     this.setState(prevState => ({
                         loop: prevState.loop + 1 <= 5 ? prevState.loop + 1 : 0
                     }));
                 }, 125)
             });
        }
    }

    componentDidUpdate() {
        const ctx = this.refs.loader.getContext('2d');

        for(let i = 0; i < 5; i++) {
            if(i < 3) {
                ctx.fillStyle = this.state.loop !== i ? "#106600" : "#66FF00";
                ctx.fillRect((dotSize + dotSpacing) * i, 0, dotSize, dotSize); 
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.iid)
    }

    render() {
        return (
            <canvas ref="loader" width={(dotSize + dotSpacing) * 3 - dotSpacing} height={dotSize}/>
        );
    }
}

export default Loader;