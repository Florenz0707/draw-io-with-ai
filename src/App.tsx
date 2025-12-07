import { useRef, useState } from 'react'
import './App.css'
import DrawingCanvas from './components/DrawingCanvas'
import type { DrawingCanvasRef } from './components/DrawingCanvas'
import Toolbar from './components/Toolbar'
import type { GraphData } from './utils/graphDataConverter'

function App() {
  const canvasRef = useRef<DrawingCanvasRef>(null)
  const [graphData, setGraphData] = useState<GraphData>({ cells: [] })

  const handleGraphChange = (data: GraphData) => {
    setGraphData(data)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>draw.io with AI</h1>
        <p>AI驱动的流程图编辑器</p>
      </header>
      <Toolbar canvasRef={canvasRef} />
      <div className="app-content">
        <DrawingCanvas ref={canvasRef} onGraphChange={handleGraphChange} />
      </div>
      <footer className="app-footer">
        <p>当前图表包含 {graphData.cells.length} 个元素</p>
      </footer>
    </div>
  )
}

export default App
