export class Watcher extends React.Component {

  constructor(props) {
    super(props);

    globalThis['pigalotGameState'] = globalThis['pigalotGameState'] ?? {};
    globalThis['pigalotGameState'].target = globalThis['pigalotGameState'].target ?? {};

    this.state = { targetName: globalThis['pigalotGameState'].target?.name ?? "N/A" };

    globalThis['pigalotGameState'].target.update = this.update.bind(this);
    this.header = React.createRef();
    this.mouseDown = this.mouseDown.bind(this);
  }

  update() {
    this.setState((state, props) => ({
      targetName: globalThis['pigalotGameState'].target.name
    }));
  }

  mouseDown(e) {
    console.log("ola?");
    globalThis['pigalotGameState'].drag.mouseDown(e);
  }

  render() {
    return (
      <Drag header={this.header}>
        <div id="dashboard">
          <header onMouseDown={this.mouseDown} className="dashboard-header"><h1>Dashboard</h1></header>
          <section className="card">
            <header ref={this.header}><h1>Targets</h1></header>
            <table>
              <thead>
                <tr>
                  <th>SERVER NAME</th>
                  <th>$/ms</th>
                  <th>$/ms/GB</th>
                  <th>cost</th>
                  <th>hN</th>
                  <th>hAmt</th>
                  <th>cL(ms)</th>
                  <th>totProcs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{this.state.targetName}</td>
                  <td>1</td>
                  <td>1</td>
                  <td>1</td>
                  <td>1</td>
                  <td>1</td>
                  <td>1</td>
                  <td>1</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </Drag>
    )
  }
}