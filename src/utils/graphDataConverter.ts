/**
 * 图表数据格式转换工具
 * 在mxGraph数据和JSON格式之间转换，用于AI交互
 */

// 从全局声明类型
declare global {
  interface Window {
    mxGraph: any;
  }
}

export interface CellStyle {
  fillColor?: string;
  strokeColor?: string;
  shape?: string;
  fontSize?: number;
  fontColor?: string;
  rounded?: boolean;
  edgeStyle?: string;
  [key: string]: any;
}

export interface GeometryData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GraphCell {
  id: string;
  type: 'vertex' | 'edge';
  value: string;
  geometry: GeometryData;
  style: CellStyle;
  source?: string; // for edges
  target?: string; // for edges
  parent?: string;
}

export interface GraphData {
  cells: GraphCell[];
  viewport?: {
    scale: number;
    translate: { x: number; y: number };
  };
}

/**
 * 将mxGraph模型转换为JSON格式
 */
export function exportGraphToJSON(graph: any): GraphData {
  const cells: GraphCell[] = [];
  const model = graph.getModel();
  const root = model.getRoot();

  // 遍历所有单元格
  const cellsToProcess = root ? root.children || [] : [];

  cellsToProcess.forEach((cell: any) => {
    const graphCell = cellToJSON(cell);
    if (graphCell) {
      cells.push(graphCell);
    }
  });

  // 获取视口信息
  const view = graph.getView();
  const scale = view.getScale();
  const translate = view.getTranslate();

  return {
    cells,
    viewport: {
      scale,
      translate: { x: translate.x, y: translate.y },
    },
  };
}

/**
 * 将单个mxCell转换为GraphCell对象
 */
function cellToJSON(cell: any): GraphCell | null {
  if (!cell) return null;

  const isEdge = cell.isEdge?.() || false;
  const isVertex = cell.isVertex?.() || false;

  if (!isEdge && !isVertex) return null;

  const geometry = cell.getGeometry();
  const style = cell.getStyle() || '';

  const graphCell: GraphCell = {
    id: cell.getId?.() || '',
    type: isEdge ? 'edge' : 'vertex',
    value: cell.getValue?.() as string || '',
    geometry: geometry
      ? {
          x: geometry.x || 0,
          y: geometry.y || 0,
          width: geometry.width || 0,
          height: geometry.height || 0,
        }
      : { x: 0, y: 0, width: 0, height: 0 },
    style: parseStyle(style),
    parent: cell.getParent?.()?.getId?.() || undefined,
  };

  // 处理边的source和target
  if (isEdge) {
    const source = cell.getSource?.();
    const target = cell.getTarget?.();
    graphCell.source = source?.getId?.() || undefined;
    graphCell.target = target?.getId?.() || undefined;
  }

  return graphCell;
}

/**
 * 解析mxGraph样式字符串为对象
 */
function parseStyle(styleStr: string): CellStyle {
  const style: CellStyle = {};

  if (!styleStr) return style;

  const parts = styleStr.split(';');
  parts.forEach((part) => {
    const [key, value] = part.split('=');
    if (key && value) {
      style[key.trim()] = parseStyleValue(value.trim());
    }
  });

  return style;
}

/**
 * 解析样式值（处理布尔值、数字等）
 */
function parseStyleValue(value: string): any {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(Number(value))) return Number(value);
  return value;
}

/**
 * 将JSON格式数据导入到mxGraph中
 */
export function importGraphFromJSON(
  graph: any,
  data: GraphData,
  clearExisting: boolean = true
): void {
  const model = graph.getModel();

  model.beginUpdate();
  try {
    // 清空现有单元格
    if (clearExisting) {
      const root = model.getRoot();
      if (root && root.children) {
        graph.removeCells(root.children.slice());
      }
    }

    const parent = graph.getDefaultParent();
    const idMap: { [key: string]: any } = {};

    // 第一步：创建所有顶点
    data.cells.forEach((cellData) => {
      if (cellData.type === 'vertex') {
        const cell = insertVertex(graph, cellData, parent);
        idMap[cellData.id] = cell;
      }
    });

    // 第二步：创建所有边（此时顶点已存在）
    data.cells.forEach((cellData) => {
      if (cellData.type === 'edge' && cellData.source && cellData.target) {
        const source = idMap[cellData.source];
        const target = idMap[cellData.target];
        if (source && target) {
          insertEdge(graph, cellData, parent, source, target);
        }
      }
    });

    // 恢复视口信息
    if (data.viewport) {
      graph.getView().setScale(data.viewport.scale);
      graph.getView().setTranslate(data.viewport.translate.x, data.viewport.translate.y);
    }
  } finally {
    model.endUpdate();
  }
}

/**
 * 插入顶点
 */
function insertVertex(
  graph: any,
  cellData: GraphCell,
  parent: any
): any {
  const styleStr = formatStyle(cellData.style);
  const cell = graph.insertVertex(
    parent,
    cellData.id,
    cellData.value,
    cellData.geometry.x,
    cellData.geometry.y,
    cellData.geometry.width,
    cellData.geometry.height,
    styleStr
  );
  return cell;
}

/**
 * 插入边
 */
function insertEdge(
  graph: any,
  cellData: GraphCell,
  parent: any,
  source: any,
  target: any
): any {
  const styleStr = formatStyle(cellData.style);
  const cell = graph.insertEdge(
    parent,
    cellData.id,
    cellData.value,
    source,
    target,
    styleStr
  );
  return cell;
}

/**
 * 将样式对象格式化为mxGraph样式字符串
 */
function formatStyle(style: CellStyle): string {
  const parts: string[] = [];

  Object.entries(style).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const formattedValue = typeof value === 'boolean' ? String(value) : String(value);
      parts.push(`${key}=${formattedValue}`);
    }
  });

  return parts.join(';');
}
