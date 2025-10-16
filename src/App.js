import './styles/App.css';
import React, { Fragment, useEffect, useState } from 'react';
import './styles/Table.css';
import Visualizer from './components/Visualizer.js';

import WallIcon from './svg/wall-icon.svg';
import EraserIcon from './svg/eraser-icon.svg';
import FlagGreenIcon from './svg/flag-green-icon.svg';
import FlagRedIcon from './svg/flag-red-icon.svg';
import PinSymbol from './svg/pin-symbol.svg';

let brushType = 'wall';

function wall() {brushType = 'wall'};
function empty() {brushType = 'empty'};
function start() {brushType = 'start'};
function end() {brushType = 'end'};

const tableRows = 17;
const tableCols = 43;

let visualizer = new Visualizer(tableRows, tableCols);

class Cell extends React.Component {
    constructor(props) {
        super(props);
        
        visualizer.grid[this.props.gridId[0]][this.props.gridId[1]] = this;

        this.mutable = true;
        this.updateContent = this.updateContent.bind(this);
        this.update = this.update.bind(this);
        
        let x = this.props.gridId[0];
        let y = this.props.gridId[1];

        let type = 'empty';

        if (x === 1 && y === 1) {visualizer.setStart(this); type = 'start'};
        if (x === tableRows - 2 && y === tableCols - 2) {visualizer.setEnd(this); type = 'end'};

        this.state = {
            content: <div draggable = 'false' className = {'cell ' + type} ></div>,
            contentType: type,
        }
    }
    
    render() {
        return (
            <td className = {this.props.className} onMouseDown = {this.update} onMouseOver = {this.update} onMouseUp = {this.update}>{
                this.state.content
                }</td>
        )
    }

    updateContent(contentType, contentState = '') {
        this.setState({contentType: contentType, contentState: contentState});
        this.setState({content: <div draggable = 'false' className = {'cell ' + contentType + contentState}></div>})
    }

    update(event) {
        // check if update is possible

        if (!this.mutable || visualizer.onCoolDown) {return}

        if (event.type === 'mouseup') {visualizer.mouseDown = false; return}
        else if (event.type === 'mousedown') {visualizer.mouseDown = true}
        else if (event.type === 'mouseover' && !visualizer.mouseDown) {return}

        const contentType = this.state.contentType;

        if (contentType === 'start' || contentType === 'end') {return}
        if ((brushType === 'start' || brushType === 'end') && event.type === 'mouseover') {return}
        if (contentType === brushType) {return}

        if (brushType === 'empty' && (contentType === 'path' || contentType === 'visited')) {return}
        
        //execute update

        if (visualizer.visualized) {
            visualizer.after(600, () => { visualizer.instantPath(); });
        }

        let delay = 0;
            
        this.mutable = false;
        if ((brushType === 'end' || brushType === 'start') && contentType !== 'empty') {this.kill(); delay = 500};

        visualizer.after(delay, () => {
            switch(brushType) {
                case 'wall':  visualizer.updateCell('wall', this); this.updateContent('wall'); break;
                case 'empty': visualizer.updateCell('empty', this); this.kill(); break;
                case 'start': visualizer.updateStart(this); this.updateContent('start'); break;
                case 'end':   visualizer.updateEnd(this); this.updateContent('end'); break;
            }
            this.mutable = true;
            
        });

    }

    kill() {
        this.mutable = false;
        this.updateContent(this.state.contentType, ' dying');

        visualizer.after(500, () => {
            this.updateContent('empty');
            this.mutable = true;
        });
    }
}

class Cols extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: null,
            contentType: "none"
        };

        this.cols = [];
        let classes, key;

        for (let i = 0; i < tableCols; i++) {
            classes = 'cols ' + props.index.toString() + '-' + i.toString();
            key = this.props.index.toString() + i.toString();
            this.cols.push(<Cell className = {classes} key = {key} gridId = {[this.props.index, i]}/>)
        }
    }

    render() {
        return (
            <Fragment>
                {this.cols}
            </Fragment>
        )
    }
}

class Rows extends React.Component {

    constructor() {
        super();

        this.rows = [];
        let classes;
        for (let i = 0; i < tableRows; i++) {
            classes = 'rows ' + i.toString();
            this.rows.push(<tr className = {classes} key = {i}>
                <Cols index = {i}></Cols>
            </tr>)
        }
    }

    render() {
        return (
            <Fragment>
                {this.rows}
            </Fragment>
        )
    }
} 

function Table() {
    return (
		<div id = 'table-holder'>
            <table id = 'main-table'>
                <tbody>
                    <Rows></Rows>
                </tbody>
            </table>
		</div>
	)
}

function Modal(props) {
    if (!props.display) {
        return null;
    }
    return (
        <div id = 'modal-container'>
            <div className = 'modal'>
                <Slider/>
                <span className = 'modal-close' onClick = {props.close}>
                </span>
            </div>
        </div>
    )
}

function Slider() {
    const slides = [
        {header :'Pathfinding Visualizer' , content: [(<img src={PinSymbol} alt="Pin symbol" />), <p className = 'slide-content'><br/>A tool made to demonstrate the behavior of pathfinding algorithms in a fun and interactive way.</p>]},
        {header :'Pathfinders Goal', content: ['', <p className = 'slide-content'>The goal of a pathfinding algorithm is to search for and find a route from a starting point to an end point by evaluating and testing possible steps. <br/><br/><br/><br/><br/><br/><br/> Pathfinding algorithms are used in a wide variety of subjects from video games to self-driving vehicles and even in satellite navigational systems.</p>]},
        {header :'Node Types', content: ['', <div className = 'div-slide-content'> <div><div className = 'cellprop wall'/><p>Obstacles</p></div><div><div className = 'cellprop start'/>Start node</div><div><div className = 'cellprop end'/>End node</div><div><div className = 'cellprop visited'/>Visited nodes</div><div><div className = 'cellprop path'/>Final path</div></div>]},
        {header :'Different Algorithms', content: ['', <p className = 'slide-content'>This tool features two different algorithms:<br/><br/>A-star:<br/>This is an informed algorithm meaning that it knows the position of the end point and uses that information to search for a path more efficiently and is guaranteed to find an optimal path.<br/> <br/>Djikstra:<br/>Unlike A-star, Djikstra is an uninformed algorithm and works by first testing the closest possible move to the starting point and is also guaranteed to find an optimal path.</p>]}
    ]
    const [currentIndex, setIndex] = useState(0);

    function slideRight() {
        let isFirstSlide = currentIndex === 0;
        let newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;

        setIndex(newIndex);
    }

    function slideLeft() {
        let isLastSlide = currentIndex === slides.length - 1;
        let newIndex = isLastSlide ? 0 : currentIndex + 1;

        setIndex(newIndex);
    }
    return (
        <div className = 'slider'>
            <div className = 'slide'>
                <h1 className = 'slide-header'> {slides[currentIndex].header} </h1>
                <div> {slides[currentIndex].content[0]} </div>
                <div> {slides[currentIndex].content[1]} {slides[currentIndex].content[2]} {slides[currentIndex].content[3]} {slides[currentIndex].content[4]} {slides[currentIndex].content[5]}</div>
            </div>
            <div className = 'arrow left' onClick = {slideRight}> &#8249; </div>
            <div className = 'page-counter'> {currentIndex + 1} / {slides.length} </div>
            <div className = 'arrow right' onClick= {slideLeft}> &#8250; </div>
        </div>

    )
}

function App() {
    const [display, setDisplay] = useState(true);
    const [isHidden, setHidden] = useState(false);
    const hide = event => {setHidden (true)};
    const show = event => {setHidden (false)};

    useEffect(() => {
        const handleMouseUp = () => { visualizer.mouseDown = false; };
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, []);
	return (
		<Fragment>
			<div id='nav-bar'>

                <div className = 'button-holder' onMouseEnter = {hide} onMouseLeave = {show}>
                    <a className = 'behind-button' onClick = {() => {visualizer.changeAlgorithm(0)}}> Astar </a>
                    <a className = 'behind-button' onClick = {() => {visualizer.changeAlgorithm(1)}}> Djikstra </a>

                    <a className = {isHidden? 'front-button hidden' : 'front-button'}> Choose Algorithm </a>
                </div>

                <a className = 'nav-button' onClick = {() => {visualizer.makeMaze()}}> Make A Maze </a>
				<a className = 'nav-button' onClick = {() => {visualizer.visualizePath()}}> Visualize! </a>
				<a className = 'nav-button' onClick = {() => {visualizer.clearBoard()}}> Clear Board </a>
                <a className = 'nav-button' onClick = {() => {setDisplay(true)}}> Guide </a>
			</div>
            

            <div className = "radio-toolbar" role = "group" aria-label = "Tool selection">
                <input type = 'radio' id = "radio1" name = 'brush' onClick = {wall} defaultChecked/>
                <label htmlFor = 'radio1'>
                    <img src={WallIcon} alt="Wall brush" />
                    <span className='label-text'>Wall</span>
                </label>

                <input type = 'radio' id = "radio2" name = 'brush' onClick = {empty} />
                <label htmlFor = 'radio2'>
                    <img src={EraserIcon} alt="Erase brush" />
                    <span className='label-text'>Erase</span>
                </label>

                <input type = 'radio' id = "radio3" name = 'brush' onClick = {start} />
                <label htmlFor = 'radio3'>
                    <img src={FlagGreenIcon} alt="Start node brush" />
                    <span className='label-text'>Start</span>
                </label>

                <input type = 'radio' id = "radio4" name = 'brush' onClick = {end} />
                <label htmlFor = 'radio4'>
                    <img src={FlagRedIcon} alt="End node brush" />
                    <span className='label-text'>End</span>
                </label>
            </div>

			<Table/>
            <Modal close = {() => {setDisplay(false)}} display = {display} />
		</Fragment>
	);
}

export default App;