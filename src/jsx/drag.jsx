export class Drag extends React.Component {
    constructor(props) {
        super(props);

        this.referance = React.createRef();

        this.state = {
            lastX: 0,
            lastY: 0,
            style: {
                transform: `translate(0px, 0px)` 
            }
        }

        this.header = props.header;

        this.mouseDown = this.mouseDown.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
        this.mouseMove = this.mouseMove.bind(this);

        globalThis['pigalotGameState'] = globalThis['pigalotGameState'] ?? {};
        globalThis['pigalotGameState'].drag = globalThis['pigalotGameState'].drag ?? {};
        globalThis['pigalotGameState'].drag.mouseDown = this.mouseDown;
    }

    onReadyForEvent() {
        this.header.current.addEventListener("onmousedown", this.mouseDown, false);
    }

    mouseDown(e) {
        e.preventDefault();
        this.setState((state, props) => {
            state.lastX = e.clientX;
            state.lastY = e.clientY;
        });

        console.log("Hello?");

        globalThis["document"].addEventListener("onmouseup", this.mouseUp, false);
        globalThis["document"].onmousemove = this.mouseMove;
    }

    mouseUp(e) {
        e.preventDefault();
        console.log("I can see it in your eyes");
        globalThis["document"].removeEventListener("onmouseup", this.mouseUp, false);
        globalThis["document"].removeEventListener("onmousemove", this.mouseMove, false);
    }

    mouseMove(e) {
        e.preventDefault();
        console.log("is it me your looking for?");
        const difX = this.state.lastX - e.clientX;
        const difY = this.state.lastY - e.clientY;

        const x = this.referance.current.offsetTop - difX;
        const y = this.referance.current.offsetLeft - difY;

        this.setState((state, props) => {
            state.lastX = e.clientX;
            state.lastY = e.clientY;
            state.style = {
                transform: `translate(${x}px, ${y}px)` 
            }
        });
    }

    render() {
        return <div className="drag" ref={this.referance} style={this.state.style}>
            {this.props.children}
        </div>
    }
}