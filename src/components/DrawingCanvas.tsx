/**
 * DrawingCanvas 组件
 * 集成mxGraph编辑器的核心组件
 */

import React, { useEffect, useRef } from 'react';
import type { GraphData } from '../utils/graphDataConverter';
import { exportGraphToJSON, importGraphFromJSON } from '../utils/graphDataConverter';

// 声明全局mxGraph类型
declare global {
  interface Window {
    mxGraph: any;
    mxUndoManager: any;
  }
}

export interface DrawingCanvasRef {
  getGraphData: () => GraphData;
  importGraphData: (data: GraphData) => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
}

interface DrawingCanvasProps {
  onGraphChange?: (data: GraphData) => void;
}

const DrawingCanvas = React.forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ onGraphChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<any>(null);

    // 初始化图表
    useEffect(() => {
      if (!containerRef.current) return;

      // 检查mxGraph是否已加载
      if (!window.mxGraph) {
        console.error('mxGraph库未加载');
        return;
      }

      // 创建图表实例
      const graph = new window.mxGraph(containerRef.current);

      // 基础配置
      graph.setConnectable(true);
      graph.setEdgeLabelsMovable(true);
      graph.setVertexLabelsMovable(true);

      // 禁用导出功能自动打开
      graph.allowAutoPanning = true;
      graph.pageVisible = true;
      graph.pageBreaksVisible = true;

      // 创建默认样式
      setupDefaultStyles(graph);

      // 事件监听
      const changeListener = () => {
        if (onGraphChange) {
          const data = exportGraphToJSON(graph);
          onGraphChange(data);
        }
      };

      graph.getModel().addListener('change', changeListener);

      // 撤销/重做支持
      const undoManager = new window.mxUndoManager();
      const listener = (sender: any) => {
        undoManager.undoableEditHappened(sender.getEdit());
      };
      graph.getModel().addListener('undoableEdit', listener);
      graph.getView().addListener('undoableEdit', listener);

      // 将undoManager附加到graph上，以便后续访问
      (graph as any).undoManager = undoManager;

      graphRef.current = graph;

      // 添加初始演示图形
      addSampleDiagram(graph);

      // 清理函数
      return () => {
        graph.getModel().removeListener(changeListener);
        graph.getModel().removeListener(listener);
        graph.destroy();
        graphRef.current = null;
      };
    }, [onGraphChange]);

    // 暴露给父组件的方法
    React.useImperativeHandle(ref, () => ({
      getGraphData: () => {
        if (!graphRef.current) return { cells: [] };
        return exportGraphToJSON(graphRef.current);
      },

      importGraphData: (data: GraphData) => {
        if (!graphRef.current) return;
        importGraphFromJSON(graphRef.current, data, true);
      },

      clear: () => {
        if (!graphRef.current) return;
        const model = graphRef.current.getModel();
        model.beginUpdate();
        try {
          const root = model.getRoot();
          if (root && root.children) {
            graphRef.current.removeCells(root.children.slice());
          }
        } finally {
          model.endUpdate();
        }
      },

      undo: () => {
        if (graphRef.current && (graphRef.current as any).undoManager) {
          (graphRef.current as any).undoManager.undo();
        }
      },

      redo: () => {
        if (graphRef.current && (graphRef.current as any).undoManager) {
          (graphRef.current as any).undoManager.redo();
        }
      },
    }), []);

    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #ccc',
          backgroundColor: '#fff',
          overflow: 'hidden',
          position: 'relative',
        }}
      />
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

/**
 * 设置默认样式
 */
function setupDefaultStyles(graph: any) {
  const style = graph.getStylesheet().getDefaultVertexStyle();
  style['fontSize'] = 12;
  style['fontFamily'] = 'Helvetica';
  style['fillColor'] = '#87CEEB';
  style['strokeColor'] = '#333';
  style['rounded'] = '1';

  const edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
  edgeStyle['fontSize'] = 10;
  edgeStyle['edgeStyle'] = 'orthogonalEdgeStyle';
  edgeStyle['rounded'] = '1';
  edgeStyle['jettySize'] = 'auto';
  edgeStyle['html'] = '1';
}

/**
 * 添加示例图表
 */
function addSampleDiagram(graph: any) {
  const parent = graph.getDefaultParent();

  graph.getModel().beginUpdate();
  try {
    // 创建几个示例顶点
    const v1 = graph.insertVertex(
      parent,
      null,
      'Start',
      20,
      20,
      100,
      60,
      'shape=ellipse;fillColor=#90EE90;strokeColor=#333;fontSize=12;fontStyle=1'
    );

    const v2 = graph.insertVertex(
      parent,
      null,
      'Process',
      200,
      20,
      100,
      60,
      'rounded=1;fillColor=#87CEEB;strokeColor=#333;fontSize=12'
    );

    const v3 = graph.insertVertex(
      parent,
      null,
      'Decision',
      380,
      20,
      100,
      60,
      'shape=diamond;fillColor=#FFD700;strokeColor=#333;fontSize=12'
    );

    const v4 = graph.insertVertex(
      parent,
      null,
      'End',
      560,
      20,
      100,
      60,
      'shape=ellipse;fillColor=#FFA07A;strokeColor=#333;fontSize=12;fontStyle=1'
    );

    // 创建边
    graph.insertEdge(
      parent,
      null,
      'Start Flow',
      v1,
      v2,
      'edgeStyle=orthogonalEdgeStyle;rounded=1;fontSize=10'
    );

    graph.insertEdge(
      parent,
      null,
      'Process Flow',
      v2,
      v3,
      'edgeStyle=orthogonalEdgeStyle;rounded=1;fontSize=10'
    );

    graph.insertEdge(
      parent,
      null,
      'Yes',
      v3,
      v4,
      'edgeStyle=orthogonalEdgeStyle;rounded=1;fontSize=10'
    );

    graph.insertEdge(
      parent,
      null,
      'No',
      v3,
      v2,
      'edgeStyle=orthogonalEdgeStyle;rounded=1;fontSize=10'
    );
  } finally {
    graph.getModel().endUpdate();
  }
}

export default DrawingCanvas;
